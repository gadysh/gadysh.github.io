/**
 * קובץ JavaScript ראשי
 * אתחול האתר, טעינת תוכן, ואינטגרציות
 */

import { loadHomeContent, loadUseCases, loadContentToElement } from './content-loader.js';
import { initAnimations, initSmoothScroll, animateModal, initHoverEffects } from './animations.js';

// קונפיגורציית האתר
let siteConfig = {};

// אתחול ראשוני
async function init() {
    console.log('Initializing PowOrg website...');

    // טעינת קונפיגורציה
    await loadSiteConfig();

    // טעינת תוכן לפי סוג העמוד
    const page = getPageType();

    if (page === 'home') {
        await initHomePage();
    } else if (page === 'poc') {
        await loadContentToElement('/content/poc.md', 'page-content');
    } else if (page === 'security') {
        await loadContentToElement('/content/security.md', 'page-content');
    }

    // אתחול אינטגרציות
    initWhatsApp();
    initContactForm();
    initNavigation();

    // אתחול אנימציות (אחרי שהתוכן נטען)
    setTimeout(() => {
        initAnimations();
        initSmoothScroll();
        initHoverEffects();
    }, 100);

    console.log('Website initialized successfully');
}

// טעינת קונפיגורציה
async function loadSiteConfig() {
    try {
        const response = await fetch('/data/site.json');
        siteConfig = await response.json();

        // עדכון מטא-תגיות
        updateMetaTags();
    } catch (error) {
        console.error('Error loading site config:', error);
    }
}

// עדכון meta tags
function updateMetaTags() {
    if (!siteConfig.seo) return;

    document.title = siteConfig.seo.title || 'PowOrg';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = siteConfig.seo.description;
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = siteConfig.seo.title;

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = siteConfig.seo.description;
}

// זיהוי סוג עמוד
function getPageType() {
    const path = window.location.pathname;
    if (path.includes('poc.html')) return 'poc';
    if (path.includes('security.html')) return 'security';
    return 'home';
}

// אתחול עמוד הבית
async function initHomePage() {
    // טעינת תוכן ראשי
    await loadHomeContent();

    // טעינת גלריית מקרי שימוש
    await initUseCasesGallery();
}

// יצירת גלריית מקרי שימוש
async function initUseCasesGallery() {
    const useCases = await loadUseCases();
    const gallery = document.getElementById('use-cases-gallery');

    if (!gallery || useCases.length === 0) return;

    gallery.innerHTML = useCases.map(useCase => `
    <article class="glass-card" data-use-case="${useCase.id}" style="display: flex; flex-direction: column; height: 100%;">
      <div class="icon-box">
        <img src="${useCase.iconPath}" alt="" aria-hidden="true">
      </div>
      
      <h3 style="margin-bottom: 0.5rem; color: var(--text);">${useCase.title}</h3>
      
      <p style="font-size: 0.95rem; color: var(--muted); flex-grow: 1; margin-bottom: 1.5rem;">
        ${useCase.oneLiner}
      </p>
      
      ${useCase.tags.length > 0 ? `
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
          ${useCase.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
      
      <button class="btn-link" onclick="window.openUseCaseModal('${useCase.id}')" style="align-self: flex-start; color: var(--accent-cyan); background: none; border: none; padding: 0; font-weight: 600; cursor: pointer;">
        קרא עוד <span style="margin-right: 4px;">←</span>
      </button>
    </article>
  `).join('');

    // שמירת use cases גלובלית למודאל
    window.useCasesData = useCases;
}

// פתיחת modal למקרה שימוש
window.openUseCaseModal = function (useCaseId) {
    const useCase = window.useCasesData?.find(uc => uc.id === useCaseId);
    if (!useCase) return;

    const modal = document.getElementById('use-case-modal');
    if (!modal) return;

    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;

    // המרת Markdown ל-HTML
    const html = marked.parse(useCase.content);
    modalBody.innerHTML = html;

    // פתיחה עם אנימציה
    animateModal(modal, true);
}

// סגירת modal
window.closeUseCaseModal = function () {
    const modal = document.getElementById('use-case-modal');
    if (!modal) return;
    animateModal(modal, false);
}

// אתחול כפתור WhatsApp
function initWhatsApp() {
    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (!whatsappBtn || !siteConfig.contact) return;

    const { whatsapp, whatsappMessage } = siteConfig.contact;
    const message = encodeURIComponent(whatsappMessage || 'שלום');
    const url = `https://wa.me/${whatsapp}?text=${message}`;

    whatsappBtn.href = url;
    whatsappBtn.target = '_blank';
    whatsappBtn.rel = 'noopener noreferrer';
}

// אתחול טופס צור קשר
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // אם יש endpoint מוגדר
        if (siteConfig.contact?.formEndpoint) {
            try {
                const response = await fetch(siteConfig.contact.formEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showFormMessage('ההודעה נשלחה בהצלחה! נחזור אליך בקרוב.', 'success');
                    form.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                showFormMessage('שגיאה בשליחת הטופס. אנא נסה שוב או צור קשר בוואטסאפ.', 'error');
            }
        } else {
            // Fallback - mailto
            const subject = encodeURIComponent('פנייה מהאתר');
            const body = encodeURIComponent(
                `שם: ${data.name}\nארגון: ${data.organization}\nתפקיד: ${data.role}\nאימייל/טלפון: ${data.contact}\n\nהודעה:\n${data.message}`
            );
            window.location.href = `mailto:${siteConfig.contact.email}?subject=${subject}&body=${body}`;
        }
    });
}

// הצגת הודעה בטופס
function showFormMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// אתחול ניווט
function initNavigation() {
    // סגירת תפריט מובייל בלחיצה על קישור
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            if (navToggle && navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Toggle תפריט מובייל
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// סגירת modal בלחיצה על רקע
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeUseCaseModal();
    }
});

// סגירת modal ב-ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeUseCaseModal();
    }
});

// אתחול בטעינת הדף
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
