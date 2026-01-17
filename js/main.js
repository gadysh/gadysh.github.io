import { initAnimations } from './animations.js';

// --- Configuration & Data ---

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
    // 1. Initialize Animations (GSAP)
    initAnimations();

    // 2. Load Process Content (Markdown)
    loadMarkedContent('/content/home.md', 'process-content');

    // 3. Render Use Cases Gallery
    initUseCasesGallery();

    // 4. Contact Form Handler
    initContactForm();
});

/**
 * Loads Markdown content, parses it, and injects it into a container.
 */
async function loadMarkedContent(url, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();

        // Configure marked for security and clean output
        // Assuming marked is loaded globally via CDN script tag in index.html
        if (typeof marked !== 'undefined') {
            container.innerHTML = marked.parse(text);
        } else {
            container.innerHTML = "<p>Markdown parser not loaded.</p>";
            console.error('Marked.js library not found.');
        }

    } catch (error) {
        console.error('Error loading content:', error);
        container.innerHTML = `<p style="color:red; text-align:center;">שגיאה בטעינת התוכן. אנא נסה לרענן.</p>`;
    }
}

/**
 * Renders the Use Cases cards into the Bento Grid.
 */
function initUseCasesGallery() {
    const gallery = document.getElementById('use-cases-gallery');
    if (!gallery) return;

    gallery.innerHTML = useCases.map((useCase, index) => {
        // Stagger animation delay based on index
        return `
            <div class="clean-card use-case-card" onclick="openUseCaseModal('${useCase.title}', '${useCase.description}')">
                <div class="icon-box-clean">
                    <img src="assets/icons/${useCase.icon}" alt="${useCase.title}" onerror="this.src='/assets/icons/layers.svg'">
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

        // Simulate API call
        msgContainer.innerHTML = '<span style="color: var(--primary);">שולח...</span>';

        setTimeout(() => {
            msgContainer.innerHTML = '<span style="color: green; font-weight: bold;">ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.</span>';
            form.reset();
        }, 1500);
    });
}

// --- Global Modal Helpers (accessible from HTML) ---

window.openUseCaseModal = function (title, description) {
    const modal = document.getElementById('use-case-modal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = modal.querySelector('span'); // Simple hook

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

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('use-case-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
