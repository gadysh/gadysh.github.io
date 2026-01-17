import { initAnimations } from './animations.js';

// --- Configuration & Data (Use Cases remain data-driven for gallery) ---

const useCases = [
    {
        icon: 'briefcase.svg', // will map to a generic clean icon if missing
        title: 'מחלקת כספים',
        description: 'סוכן שחשבוניות ספקים, מתייק במערכת ומפיק דוחות מעקב.',
        modalId: 'finance'
    },
    {
        icon: 'users.svg',
        title: 'גיוס ו-HR',
        description: 'סינון קורות חיים אוטומטי, תיאום ראיונות וניתוח התאמה ראשוני.',
        modalId: 'hr'
    },
    {
        icon: 'shield.svg',
        title: 'Legal & Compliance',
        description: 'בדיקת חוזים, התראות על חריגות רגולטוריות וניהול מאגר מסמכים.',
        modalId: 'legal'
    },
    {
        icon: 'target.svg',
        title: 'מרקטינג',
        description: 'יצירת תכנים, ניתוח קמפיינים וזיהוי מגמות שוק בזמן אמת.',
        modalId: 'marketing'
    },
    {
        icon: 'cpu.svg',
        title: 'IT & DevOps',
        description: 'ניטור שרתים, פתרון תקלות ראשוני (L1) וניהול הרשאות משתמשים.',
        modalId: 'it'
    },
    {
        icon: 'shopping-cart.svg',
        title: 'E-commerce',
        description: 'שירות לקוחות אוטומטי, ניהול מלאי חכם והמלצות פרסונליזציה.',
        modalId: 'ecommerce'
    }
];

// --- Core Functions ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Animations (GSAP) - will be triggered after content load

    // 2. Load & Parse Home Content (The Big Parser)
    loadAndParseHome();

    // 3. Render Use Cases Gallery
    initUseCasesGallery();

    // 4. Contact Form Handler
    initContactForm();
});

/**
 * Main Content Parser
 * Fetches Markdown, splits by H2 sections, and populates DOM.
 */
async function loadAndParseHome() {
    try {
        const response = await fetch('/content/home.md');
        if (!response.ok) throw new Error('Failed to load home.md');
        const text = await response.text();

        // Check if marked is available
        if (typeof marked === 'undefined') {
            console.error('Marked.js not loaded');
            return;
        }

        // --- Parsing Strategy ---
        // 1. Convert entire MD to HTML tokens/tree is hard with simple splitting.
        // 2. We will split by "## " (H2) to get sections.

        const sections = text.split(/^##\s+/gm);

        sections.forEach(section => {
            const lines = section.trim().split('\n');
            const sectionTitle = lines[0].trim().toLowerCase();
            const sectionBody = lines.slice(1).join('\n'); // Everything after title

            if (sectionTitle.includes('hero')) {
                parseHero(sectionBody);
            } else if (sectionTitle.includes('outcomes')) {
                parseOutcomes(sectionBody);
            } else if (sectionTitle.includes('process')) {
                parseProcess(sectionBody);
            } else if (sectionTitle.includes('contact')) {
                parseContact(sectionBody);
            }
        });

        // Initialize animations *after* DOM is populated
        initAnimations();

    } catch (error) {
        console.error('Error parsing home content:', error);
    }
}

function parseHero(mdContent) {
    // Expected format:
    // ### כותרת
    // Text...
    // ### תת כותרת
    // Text...
    // ### כפתור ראשי
    // Text...
    // ### כפתור משני
    // Text...

    const titleMatch = mdContent.match(/### כותרת\s+([\s\S]*?)(?=###|$)/);
    const subtitleMatch = mdContent.match(/### תת כותרת\s+([\s\S]*?)(?=###|$)/);
    const btnPrimaryMatch = mdContent.match(/### כפתור ראשי\s+([\s\S]*?)(?=###|$)/);
    const btnSecondaryMatch = mdContent.match(/### כפתור משני\s+([\s\S]*?)(?=###|$)/);

    if (titleMatch) document.getElementById('hero-title').innerHTML = marked.parseInline(titleMatch[1].trim());
    if (subtitleMatch) document.getElementById('hero-subtitle').innerHTML = marked.parseInline(subtitleMatch[1].trim());
    if (btnPrimaryMatch) document.getElementById('hero-btn-primary').innerText = btnPrimaryMatch[1].trim();
    if (btnSecondaryMatch) document.getElementById('hero-btn-secondary').innerText = btnSecondaryMatch[1].trim();
}

function parseOutcomes(mdContent) {
    // Expected format: Multiple "### Title \n Text" blocks
    const container = document.getElementById('outcomes-grid');
    if (!container) return;

    // Split by H3 keys
    const items = mdContent.split(/^###\s+/gm).slice(1); // skip empty first part

    let html = '';
    items.forEach(item => {
        const lines = item.trim().split('\n');
        const title = lines[0].trim();
        const text = lines.slice(1).join('\n').trim();

        html += `
            <div>
                <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">${title}</h3>
                <p style="color: var(--text-muted);">${text}</p>
            </div>
        `;
    });

    container.innerHTML = html;
}

function parseProcess(mdContent) {
    // Expected: HTML cards or MD. Since we put HTML in MD for cards, 
    // we can just render it. If it was clean MD, we'd wrap it.
    // Our home.md currently creates <div class="clean-card">...</div>

    const container = document.getElementById('process-content');
    if (container) {
        // marked will parse the HTML inside MD correctly usually
        container.innerHTML = marked.parse(mdContent);
    }
}

function parseContact(mdContent) {
    const titleMatch = mdContent.match(/### כותרת\s+([\s\S]*?)(?=###|$)/);
    const textMatch = mdContent.match(/### טקסט\s+([\s\S]*?)(?=###|$)/);

    if (titleMatch) document.getElementById('contact-title').innerHTML = marked.parseInline(titleMatch[1].trim());
    if (textMatch) document.getElementById('contact-subtitle').innerHTML = marked.parseInline(textMatch[1].trim());
}


/**
 * Renders the Use Cases cards into the Bento Grid.
 */
function initUseCasesGallery() {
    const gallery = document.getElementById('use-cases-gallery');
    if (!gallery) return;

    gallery.innerHTML = useCases.map((useCase, index) => {
        return `
            <div class="clean-card use-case-card" onclick="openUseCaseModal('${useCase.title}', '${useCase.description}')">
                <div class="icon-box-clean">
                    <img src="assets/icons/${useCase.icon}" alt="${useCase.title}" onerror="this.onerror=null; this.src='/assets/icons/box.svg'">
                </div>
                <h3>${useCase.title}</h3>
                <p>${useCase.description}</p>
                <div style="margin-top: auto; padding-top: 1rem; font-size: 0.9rem; font-weight: 600; color: var(--primary);">
                    קרא עוד &larr;
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Handles the contact form submission.
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgContainer = document.getElementById('form-message');

        msgContainer.innerHTML = '<span style="color: var(--primary);">שולח...</span>';

        setTimeout(() => {
            msgContainer.innerHTML = '<span style="color: green; font-weight: bold;">ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.</span>';
            form.reset();
        }, 1500);
    });
}

// --- Global Modal Helpers ---

window.openUseCaseModal = function (title, description) {
    const modal = document.getElementById('use-case-modal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = modal.querySelector('span');

    if (modal && modalBody) {
        modalTitle.innerText = title;
        modalBody.innerHTML = `
            <h3>${title}</h3>
            <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text-muted);">${description}</p>
            <hr style="margin: 2rem 0; border: 0; border-top: 1px solid var(--border-light);">
            <p><strong>איך זה עובד?</strong><br>
            הסוכן מתחבר למערכות הארגוניות, לומד את תבניות הפעולה, ומבצע את המשימות תחת נהלי האבטחה הקפדניים ביותר.</p>
            <button class="btn btn-primary" onclick="closeUseCaseModal()" style="margin-top: 1rem;">סגור</button>
        `;
        modal.style.display = 'flex';
    }
};

window.closeUseCaseModal = function () {
    const modal = document.getElementById('use-case-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.onclick = function (event) {
    const modal = document.getElementById('use-case-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
