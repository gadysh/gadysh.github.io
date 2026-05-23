import { initAnimations } from './animations.js';

// --- Configuration & Data (Use Cases remain data-driven for gallery) ---

const useCases = [
    {
        icon: 'grid.svg',
        title: 'אוטומציית בק-אופיס',
        description: 'ייעול תהליכים פנימיים, סנכרון נתונים דו-כיווני בין מערכות הליבה (ERP, CRM) וביצוע משימות אדמיניסטרטיביות מורכבות ללא מגע יד אדם.',
        modalId: 'backoffice'
    },
    {
        icon: 'document.svg',
        title: 'עיבוד מסמכים חכם',
        description: 'ניתוח, סיווג ושליפת נתונים מובנים ומדויקים מקבצים וטפסים מכל סוג (PDF, Excel, Word, סריקות ותמונות) ישירות לבסיסי הנתונים.',
        modalId: 'documents'
    },
    {
        icon: 'voice.svg',
        title: 'תובנות שמע והקלטות',
        description: 'תמלול אוטומטי, ניתוח כוונות וסנטימנט, והפקת תוצרים מעשיים (סיכומים, Action Items וכרטיסי משימות) מתוך פגישות מוקלטות ושיחות שירות.',
        modalId: 'audio'
    },
    {
        icon: 'shield.svg',
        title: 'סוכני AI פנימיים',
        description: 'סוכנים חכמים המקבלים גישה למאגרי ידע פנימיים ונהלים ארגוניים לשירות מהיר של עובדים, בקרת איכות ותמיכה בתהליכי פיתוח פנימיים.',
        modalId: 'internal-agents'
    },
    {
        icon: 'users.svg',
        title: 'סוכני AI חיצוניים',
        description: 'סוכני שיחה ותמיכה קדמית ללקוחות קצה, המבצעים פעולות קצה במערכות, תיאום פגישות, הסבר מוצרים ופתיחת קריאות שירות בצורה מאובטחת.',
        modalId: 'external-agents'
    }
];


// --- Core Functions ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Animations (GSAP)
    // 2. Load & Parse Home Content
    loadAndParseHome();

    // 3. Render Use Cases
    initUseCasesGallery();

    // 4. Contact Form
    initContactForm();

    // 5. Mobile Menu Logic
    initMobileMenu();

    // 6. Calculate Initial ROI Values
    setTimeout(() => {
        if (window.calculateROI) window.calculateROI();
    }, 200);

    // 7. Modal backdrop click & ESC key close
    const modal = document.getElementById('use-case-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                window.closeUseCaseModal();
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeUseCaseModal();
        }
    });
});

/**
 * Mobile Navigation Toggle
 */
function initMobileMenu() {
    const toggleBtn = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!toggleBtn || !navMenu) return;

    // Toggle menu on click
    toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        toggleBtn.innerText = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            toggleBtn.innerText = '☰';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            toggleBtn.innerText = '☰';
        }
    });
}

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

        const sections = text.split(/^##\s+/gm);

        sections.forEach(section => {
            const lines = section.trim().split('\n');
            const sectionTitle = lines[0].trim().toLowerCase();
            const sectionBody = lines.slice(1).join('\n'); // Everything after title

            if (sectionTitle.includes('heroextras')) {
                parseHeroExtras(sectionBody);
            } else if (sectionTitle.includes('hero')) { // Standard Hero
                parseHero(sectionBody);
            } else if (sectionTitle.includes('navbar')) {
                parseNavbar(sectionBody);
            } else if (sectionTitle.includes('sectionheaders')) {
                parseSectionHeaders(sectionBody);
            } else if (sectionTitle.includes('contactform')) {
                parseContactForm(sectionBody);
            } else if (sectionTitle.includes('contact')) { // Standard Contact
                parseContact(sectionBody);
            } else if (sectionTitle.includes('outcomes')) {
                parseOutcomes(sectionBody);
            } else if (sectionTitle.includes('process')) {
                parseProcess(sectionBody);
            } else if (sectionTitle.includes('footer')) {
                parseFooter(sectionBody);
            }
        });

        // Initialize animations *after* DOM is populated
        initAnimations();

    } catch (error) {
        console.error('Error parsing home content:', error);
    }
}

/** 
 * Helper to parse key-value lists like:
 * ### Key
 * Value
 */
function parseKeyValue(mdContent) {
    const items = {};
    const parts = mdContent.split(/^###\s+/gm).slice(1);
    parts.forEach(part => {
        const lines = part.trim().split('\n');
        const key = lines[0].trim().toLowerCase();
        const value = lines.slice(1).join('\n').trim();
        items[key] = value;
    });
    return items;
}

function parseNavbar(mdContent) {
    const lines = mdContent.trim().split('\n').map(l => l.replace(/^-\s+/, '').trim()).filter(l => l);
    // Assumes order: Home, Process, Solutions, POC, Security, Contact
    if (lines[0]) document.getElementById('nav-home').innerText = lines[0];
    if (lines[1]) document.getElementById('nav-process').innerText = lines[1];
    if (lines[2]) document.getElementById('nav-solutions').innerText = lines[2];
    if (lines[3]) document.getElementById('nav-poc').innerText = lines[3];
    if (lines[4]) document.getElementById('nav-security').innerText = lines[4];
    if (lines[5]) document.getElementById('nav-contact').innerText = lines[5];
}

function parseHeroExtras(mdContent) {
    const data = parseKeyValue(mdContent);
    // Tag is currently hardcoded in HTML as a div but user requested full extraction.
    // If we wanted to parse tag we would need an ID for it.
    // For now dealing with the Tech IDs we added.
    if (data['tech1']) document.getElementById('hero-tech1').innerText = data['tech1'];
    if (data['tech2']) document.getElementById('hero-tech2').innerText = data['tech2'];
}

function parseSectionHeaders(mdContent) {
    const data = parseKeyValue(mdContent);

    if (data['processtitle']) document.getElementById('process-title').innerText = data['processtitle'];
    if (data['processsubtitle']) document.getElementById('process-subtitle').innerText = data['processsubtitle'];

    if (data['usecasestitle']) document.getElementById('usecases-title').innerText = data['usecasestitle'];
    if (data['usecasessubtitle']) document.getElementById('usecases-subtitle').innerText = data['usecasessubtitle'];
    
    const usecasesLink = document.getElementById('usecases-link');
    if (usecasesLink && data['usecaseslink']) {
        usecasesLink.innerText = data['usecaseslink'];
    }
}

function parseContactForm(mdContent) {
    const data = parseKeyValue(mdContent);

    if (data['namelabel']) document.getElementById('label-name').innerText = data['namelabel'];
    if (data['orglabel']) document.getElementById('label-org').innerText = data['orglabel'];
    if (data['emaillabel']) document.getElementById('label-email').innerText = data['emaillabel'];
    if (data['msglabel']) document.getElementById('label-msg').innerText = data['msglabel'];
    if (data['submitbtn']) document.getElementById('submit-btn').innerText = data['submitbtn'];
}

function parseFooter(mdContent) {
    const data = parseKeyValue(mdContent);
    // Note: marked.parseInline handles HTML entities like &copy;
    if (data['copy']) document.getElementById('footer-copy').innerHTML = marked.parseInline(data['copy']);
}

function parseHero(mdContent) {
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
    const container = document.getElementById('outcomes-grid');
    if (!container) return;

    const items = mdContent.split(/^###\s+/gm).slice(1);

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
    const container = document.getElementById('process-content');
    if (container) {
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
            <div class="clean-card use-case-card" onclick="openUseCaseModal('${useCase.modalId}', '${useCase.title}', '${useCase.description.replace(/'/g, "\\'")}')">
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
async function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgContainer = document.getElementById('form-message');
        if (msgContainer) {
            msgContainer.innerHTML = '<span style="color: var(--primary); font-weight: 500;">שולח פנייה מאובטחת...</span>';
        }

        const formData = new FormData(form);
        const rawData = Object.fromEntries(formData.entries());
        const data = {
            ...rawData,
            _captcha: "false",
            _subject: `פנייה חדשה מ-PowOrg - ${rawData.organization || rawData.name}`
        };

        try {
            const response = await fetch('https://formsubmit.co/ajax/gadysh@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                if (msgContainer) msgContainer.innerHTML = '';
                form.reset();
                showSuccessToast('הפנייה שלך נרשמה בהצלחה. נציג טכנולוגי יחזור אליך תוך 24 שעות.');
            } else {
                throw new Error('FormSubmit returned status ' + response.status);
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            if (msgContainer) {
                msgContainer.innerHTML = '<span style="color: #ef4444; font-weight: bold;">אירעה שגיאה בשליחת הטופס. אנא נסה שוב או פנה אלינו ישירות ל-gadysh@gmail.com</span>';
            }
        }
    });
}

function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.background = 'rgba(8, 145, 178, 0.15)';
    toast.style.backdropFilter = 'blur(12px)';
    toast.style.border = '1px solid rgba(8, 145, 178, 0.3)';
    toast.style.color = 'var(--primary)';
    toast.style.padding = '1.25rem 2.25rem';
    toast.style.borderRadius = '16px';
    toast.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.6)';
    toast.style.zIndex = '9999';
    toast.style.direction = 'rtl';
    toast.style.textAlign = 'right';
    toast.style.fontFamily = 'Heebo, sans-serif';
    toast.style.fontSize = '1.05rem';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '14px';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(30px)';
    toast.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

    toast.innerHTML = `
        <span style="font-size: 1.5rem; color: var(--primary); font-weight: 700;">&#10003;</span>
        <div>
            <strong style="color: #ffffff; font-weight: 700;">הפנייה התקבלה בהצלחה!</strong>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px;">${message}</div>
        </div>
    `;

    document.body.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;

    // Fade in
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    // Fade out after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(30px)';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 4500);
}


// --- Global Modal Helpers ---

// Case study modal content generator
function getCaseStudyHtml(modalId) {
    const cases = {
        'backoffice': {
            challenge: 'ארגונים המעבדים עשרות עסקאות ביום מבזבזים אלפי שעות עבודה בחודש על הקמה ידנית של עסקאות, העתקת נתונים בין מערכות ERP ו-CRM, ושליחת עדכונים ידנית למנהלים. התהליך חשוף לטעויות אנוש, עיכובים ואובדן מידע.',
            solutions: [
                'סוכן AI קורא ומפענח מסמכי לקוח (הסכמים, הזמנות, אימיילים) באופן אוטומטי ומאובטח',
                'מקים עסקה חדשה ב-CRM, מעדכן מלאי ב-ERP ומארכב את המסמכים \u2013 הכל ללא מגע יד אדם',
                'שולח דוח מסכם אוטומטי למנהל האחראי עם כל פרטי העסקה'
            ],
            metrics: [
                { value: '-70%', label: 'קיצור זמן טיפול' },
                { value: '10 דק\'', label: 'לעסקה מלאה' },
                { value: '0', label: 'גיוס כ"א נוסף' }
            ],
            security: 'כל התהליך רץ בתוך גבולות ה-VPC המאובטח של הארגון. אף נתון לא יוצא החוצה.'
        },
        'documents': {
            challenge: 'צוותי כספים ורכש מעבדים מאות חשבוניות, חוזים וטפסים בחודש. הזנה ידנית של נתונים מקבצי PDF וסריקות לתוך מערכות ה-ERP גוזלת זמן יקר, חשופה לטעויות ויוצרת צווארי בקבוק תפעוליים.',
            solutions: [
                'סוכן AI סורק ומפענח מסמכים מכל סוג \u2013 PDF, Excel, Word, סריקות ותמונות',
                'מסווג אוטומטית את סוג המסמך, שולף טבלאות וסעיפים ומזין ישירות לבסיס הנתונים',
                'מבצע הכל מקומית ללא העלאת קבצים רגישים לענן חיצוני'
            ],
            metrics: [
                { value: '95%', label: 'דיוק שליפת נתונים' },
                { value: 'x20', label: 'מהיר מעיבוד ידני' },
                { value: '0', label: 'טעויות הזנה' }
            ],
            security: 'עיבוד מקומי מלא בתוך ה-VPC. אף מסמך לא נשלח לשרתים חיצוניים.'
        },
        'audio': {
            challenge: 'ישיבות הנהלה ושיחות שירות מייצרות תובנות עסקיות קריטיות שנאבדות ברגע שהפגישה מסתיימת. תמלול ידני גוזל שעות, סיכומים לא מדויקים ומשימות נופלות בין הכיסאות.',
            solutions: [
                'תמלול אוטומטי מדויק בעברית ובאנגלית עם זיהוי דוברים (Speaker Diarization)',
                'ניתוח כוונות, סנטימנט והפקת סיכומי מנהלים ורשימות משימות אוטומטיות',
                'יצירת כרטיסי משימות ישירות ב-Jira או Monday והפצה אוטומטית לצוותים'
            ],
            metrics: [
                { value: '100%', label: 'כיסוי משימות' },
                { value: '3 דק\'', label: 'לסיכום פגישה' },
                { value: '0', label: 'משימות שנפלו' }
            ],
            security: 'תמלול וניתוח מקומיים בלבד. ההקלטות לעולם לא עוזבות את הרשת הארגונית.'
        },
        'internal-agents': {
            challenge: 'עובדים מבזבזים זמן יקר בחיפוש מידע במערכות ידע פנימיות, מסמכי נהלים ומדיניות. התשובות מפוזרות בין עשרות מערכות ומעכבות קבלת החלטות קריטיות.',
            solutions: [
                'סוכן AI פנימי עם גישה מאובטחת למאגרי ידע, נהלים ומסמכי מדיניות ארגוניים',
                'מענה מדויק ומבוסס מקורות עם אימות הרשאות (RBAC) לכל עובד',
                'חיפוש וקטורי מתקדם (RAG) שמחזיר תשובות מנומקות עם קישור למסמך המקורי'
            ],
            metrics: [
                { value: '-80%', label: 'זמן חיפוש מידע' },
                { value: '24/7', label: 'זמינות מלאה' },
                { value: 'RBAC', label: 'בקרת הרשאות מלאה' }
            ],
            security: 'הסוכן פועל בתוך הרשת הפנימית בלבד. אף מידע ארגוני לא נחשף כלפי חוץ.'
        },
        'external-agents': {
            challenge: 'מוקדי שירות עמוסים, זמני תגובה ארוכים ולקוחות מתוסכלים. כל פנייה דורשת מנציג אנושי לבדוק ידנית מספר מערכות, לבצע פעולות ולתעד \u2013 תהליך יקר ואיטי.',
            solutions: [
                'סוכן AI שמטפל בפניות לקוחות בוואטסאפ, צ\'אט באתר ומייל \u2013 מאמת זהות ומבצע פעולות',
                'מתחבר למערכות השילוח, CRM ו-ERP לביצוע עדכונים בזמן אמת',
                'פותח כרטיסי שירות אוטומטיים ב-ServiceNow/Zendesk עם מלוא פרטי השיחה'
            ],
            metrics: [
                { value: '-60%', label: 'עומס מוקד שירות' },
                { value: '30 שנ\'', label: 'זמן תגובה ממוצע' },
                { value: '24/7', label: 'זמינות ללקוחות' }
            ],
            security: 'פרטי הלקוח מוגנים בתוך ה-VPC. הסוכן פועל מאחורי הפיירוול הארגוני.'
        }
    };

    const c = cases[modalId];
    if (!c) return '';

    const metricsHtml = c.metrics.map((m, i) => {
        const colors = ['var(--primary)', 'var(--primary)', 'var(--accent)'];
        const bgs = ['rgba(8, 145, 178, 0.06)', 'rgba(8, 145, 178, 0.06)', 'rgba(14, 116, 144, 0.06)'];
        const borders = ['rgba(8, 145, 178, 0.15)', 'rgba(8, 145, 178, 0.15)', 'rgba(14, 116, 144, 0.15)'];
        return `<div style="text-align: center; padding: 1.5rem; background: ${bgs[i]}; border: 1px solid ${borders[i]}; border-radius: 12px;">
            <div style="font-size: 2.5rem; font-weight: 800; color: ${colors[i]}; margin-bottom: 0.25rem;">${m.value}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${m.label}</div>
        </div>`;
    }).join('');

    const solutionsHtml = c.solutions.map(s =>
        `<li style="display: flex; align-items: center; gap: 10px; font-size: 1rem; color: var(--text-main);"><span style="color: var(--primary); font-weight: 700;">&#10003;</span> ${s}</li>`
    ).join('');

    return `
        <div class="case-study" style="direction: rtl; text-align: right;">
            <div style="margin-bottom: 2rem;">
                <h4 style="font-size: 1.1rem; color: var(--text-muted); font-weight: 600; margin-bottom: 1rem; letter-spacing: 0.02em;">האתגר</h4>
                <p style="font-size: 1.05rem; color: var(--text-main); line-height: 1.7; margin: 0;">${c.challenge}</p>
            </div>
            <div style="margin-bottom: 2rem;">
                <h4 style="font-size: 1.1rem; color: var(--text-muted); font-weight: 600; margin-bottom: 1rem; letter-spacing: 0.02em;">הפתרון</h4>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
                    ${solutionsHtml}
                </ul>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                ${metricsHtml}
            </div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-light); border-radius: 10px; margin-bottom: 2rem;">
                <span style="font-size: 1.1rem; color: var(--primary);">&#9679;</span>
                <span style="font-size: 0.9rem; color: var(--text-muted);">${c.security}</span>
            </div>
            <a href="#contact" onclick="closeUseCaseModal()" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.05rem;">קבע פגישת אפיון</a>
        </div>
    `;
}


window.openUseCaseModal = function (modalId, title, description) {
    const modal = document.getElementById('use-case-modal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = modal.querySelector('span');

    if (modal && modalBody) {
        modalTitle.innerText = title;
        const detailsHtml = getCaseStudyHtml(modalId);
        modalBody.innerHTML = `
            <p style="margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6; color: var(--text-light);">${description}</p>
            ${detailsHtml}
        `;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};


window.closeUseCaseModal = function () {
    const modal = document.getElementById('use-case-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

window.switchPersona = function (personaId) {
    const buttons = document.querySelectorAll('.persona-nav .persona-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(personaId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const panes = document.querySelectorAll('.persona-panes .persona-pane');
    panes.forEach(pane => {
        if (pane.id === `pane-${personaId}`) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
};





// --- ROI Calculator Logic ---
window.calculateROI = function () {
    const employeesSlider = document.getElementById('employees-slider');
    const hoursSlider = document.getElementById('hours-slider');
    const wageSlider = document.getElementById('wage-slider');
    const autoSlider = document.getElementById('auto-slider');

    if (!employeesSlider || !hoursSlider || !wageSlider || !autoSlider) return;

    const employees = parseInt(employeesSlider.value);
    const hours = parseInt(hoursSlider.value);
    const wage = parseInt(wageSlider.value);
    const autoPercent = parseInt(autoSlider.value) / 100;

    // Calculations
    const weeklyHoursSaved = employees * hours * autoPercent;
    const annualHoursSaved = Math.round(weeklyHoursSaved * 52);
    const annualSavings = Math.round(annualHoursSaved * wage);

    // Update value displays
    document.getElementById('val-employees').innerText = employees;
    document.getElementById('val-hours').innerText = hours;
    document.getElementById('val-wage').innerText = `₪ ${wage}`;
    document.getElementById('val-auto').innerText = `${autoSlider.value}%`;

    // Update result displays
    document.getElementById('roi-annual-savings').innerText = `₪ ${annualSavings.toLocaleString()}`;
    document.getElementById('roi-hours-saved').innerText = `${annualHoursSaved.toLocaleString()} שעות`;

    // Payback period display based on savings size
    const paybackDisp = document.getElementById('roi-payback');
    if (annualSavings > 1500000) {
        paybackDisp.innerText = 'פחות מ-4 שבועות!';
        paybackDisp.style.background = 'linear-gradient(135deg, var(--primary), var(--primary))';
    } else if (annualSavings > 750000) {
        paybackDisp.innerText = 'פחות מ-2 חודשים';
        paybackDisp.style.background = 'linear-gradient(135deg, #3b82f6, var(--primary))';
    } else {
        paybackDisp.innerText = 'פחות מ-3 חודשים';
        paybackDisp.style.background = 'linear-gradient(135deg, #8b5cf6, #c084fc)';
    }
    paybackDisp.style.webkitBackgroundClip = 'text';
    paybackDisp.style.webkitTextFillColor = 'transparent';
};
