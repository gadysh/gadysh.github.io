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
    // Assumes order: Home, Process, Solutions, Security, Contact
    if (lines[0]) document.getElementById('nav-home').innerText = lines[0];
    if (lines[1]) document.getElementById('nav-process').innerText = lines[1];
    if (lines[2]) document.getElementById('nav-solutions').innerText = lines[2];
    if (lines[3]) document.getElementById('nav-security').innerText = lines[3];
    if (lines[4]) document.getElementById('nav-contact').innerText = lines[4];
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
    toast.style.background = 'rgba(16, 185, 129, 0.15)';
    toast.style.backdropFilter = 'blur(12px)';
    toast.style.border = '1px solid rgba(16, 185, 129, 0.3)';
    toast.style.color = '#34d399';
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
        <span style="font-size: 1.5rem; filter: drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4));">✨</span>
        <div>
            <strong style="color: #ffffff; font-weight: 700;">הפנייה התקבלה בהצלחה!</strong>
            <div style="font-size: 0.9rem; color: #a7f3d0; margin-top: 4px;">${message}</div>
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

window.openUseCaseModal = function (modalId, title, description) {
    const modal = document.getElementById('use-case-modal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = modal.querySelector('span');

    if (modal && modalBody) {
        modalTitle.innerText = title;
        
        let detailsHtml = '';
        if (modalId === 'backoffice') {
            detailsHtml = `
                <div class="modal-workflow-grid" style="direction: rtl; text-align: right;">
                    <div style="grid-column: 1 / -1; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.8rem; filter: drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4));">🏆</span>
                        <div>
                            <strong style="color: #34d399; font-size: 1.1rem; display: block; margin-bottom: 4px;">סיפור מקרה מנצח: יעילות תפעולית יוצאת דופן</strong>
                            <p style="font-size: 0.95rem; color: #a7f3d0; margin: 0; line-height: 1.5;">הקמת עסקה אוטומטית מלאה בתוך <strong>10 דקות בלבד</strong>, חיסכון ישיר של <strong>אלפי דקות עבודה ידניות בחודש</strong> לארגון, ואיפשור צמיחה עסקית מהירה ללא צורך בגיוס כוח אדם נוסף.</p>
                        </div>
                    </div>
                    
                    <div class="workflow-step-card input-card">
                        <div class="step-badge">קלט (Input)</div>
                        <div class="step-details">
                            <strong>קובץ הזמנה / אימייל לקוח:</strong>
                            <pre class="step-preview-code LTR">Request: "Reconcile SKU-9087 in SAP ERP and update CRM"</pre>
                            <p>קריאה ועיבוד אוטומטי של אימייל לקוח המבקש סנכרון רכש, או משימת קניות בפורמט JSON/XML.</p>
                        </div>
                    </div>
                    <div class="workflow-step-card process-card">
                        <div class="step-badge">תהליך פנימי (VPC Workflow)</div>
                        <div class="step-details">
                            <strong>אורקסטרציה מקומית מאובטחת:</strong>
                            <ul class="step-bullets">
                                <li>אימות הרשאות RBAC של המשתמש מול <strong>Okta/Active Directory</strong></li>
                                <li>שאילתה מאובטחת ומקומית דרך ה-API הפנימי של SAP ERP לבדיקת מלאי וזמינות פריטים</li>
                                <li>פנייה לעדכון מהיר של Opportunity ב-Salesforce</li>
                                <li>רישום והפקת לוגיקה ל-SIEM הארגוני</li>
                            </ul>
                        </div>
                    </div>
                    <div class="workflow-step-card output-card">
                        <div class="step-badge">פלט (Output)</div>
                        <div class="step-details">
                            <strong>תוצרים ועדכון מערכות:</strong>
                            <pre class="step-preview-code LTR" style="color: #10b981;">{ "sap_status": "Reconciled", "salesforce_update": "Opportunity Draft Created" }</pre>
                            <p>המלאי ב-SAP מעודכן, CRM מסונכרן במלואו, וטיוטת מייל מנוסחת מוכנה ב-Drafts של ה-Outbox ללא זליגת נתונים.</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (modalId === 'documents') {
            detailsHtml = `
                <div class="modal-workflow-grid" style="direction: rtl; text-align: right;">
                    <div class="workflow-step-card input-card">
                        <div class="step-badge">קלט (Input)</div>
                        <div class="step-details">
                            <strong>מסמכים סרוקים וקבצי רכש:</strong>
                            <pre class="step-preview-code LTR">PDF, Word, Excel, TIFF, JPEG scans of complex corporate documents</pre>
                            <p>קליטת חשבוניות רכש מורכבות, חוזי לקוחות מרובי דפים, טבלאות נתונים ארוכות או צילומי שטרות מטען ללא כל הגבלת פורמט.</p>
                        </div>
                    </div>
                    <div class="workflow-step-card process-card">
                        <div class="step-badge">תהליך פנימי (VPC Workflow)</div>
                        <div class="step-details">
                            <strong>עיבוד והבנה מקומית:</strong>
                            <ul class="step-bullets">
                                <li>הפעלת מנוע OCR ו-Parser מרחבי (Spatial layout analysis) מאובטח פנימית</li>
                                <li>סיווג סוג המסמך ושליפת טבלאות וסעיפים ללא כל העלאת קבצים רגישים לעננים ציבוריים</li>
                                <li>מיפוי השדות לפורמט בסיס הנתונים הארגוני באמצעות מודל שפה סגור</li>
                            </ul>
                        </div>
                    </div>
                    <div class="workflow-step-card output-card">
                        <div class="step-badge">פלט (Output)</div>
                        <div class="step-details">
                            <strong>נתונים מובנים ומערכות יעד:</strong>
                            <pre class="step-preview-code LTR" style="color: #10b981;">{ "vendor": "Intel Corp", "invoice_total": "$145,200", "tables_parsed": 1 }</pre>
                            <p>פקודת יומן מוזנת אוטומטית לבסיס הנתונים (SQL Server / Oracle / ERP), קובץ JSON מובנה וקובץ ארכיון מסווג ומאורגן מופק לרשת.</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (modalId === 'audio') {
            detailsHtml = `
                <div class="modal-workflow-grid" style="direction: rtl; text-align: right;">
                    <div class="workflow-step-card input-card">
                        <div class="step-badge">קלט (Input)</div>
                        <div class="step-details">
                            <strong>קבצי שמע ושיחות מוקלטות:</strong>
                            <pre class="step-preview-code LTR">MP3, WAV, M4A raw meeting recordings or customer service calls</pre>
                            <p>הקלטת פגישת התנעה שבועית, ישיבת הנהלה ארוכה או שיחת שירות מורכבת מול נציגי החברה.</p>
                        </div>
                    </div>
                    <div class="workflow-step-card process-card">
                        <div class="step-badge">תהליך פנימי (VPC Workflow)</div>
                        <div class="step-details">
                            <strong>תמלול וניתוח כוונות:</strong>
                            <ul class="step-bullets">
                                <li>מנוע תמלול מקומי רגיש לרעשים והפרעות (Speech-to-Text) מייצר טקסט עברית/אנגלית מדויק</li>
                                <li>חלוקה אוטומטית לדוברים (Diarization) וזיהוי כוונות וסנטימנט</li>
                                <li>ניתוח מרובה סוכנים להפקת תובנות, סיכומים ורשימת משימות</li>
                            </ul>
                        </div>
                    </div>
                    <div class="workflow-step-card output-card">
                        <div class="step-badge">פלט (Output)</div>
                        <div class="step-details">
                            <strong>סיכומים וכרטיסי Jira:</strong>
                            <pre class="step-preview-code LTR" style="color: #10b981;">{ "actions": ["CTO to approve spec", "Dev to deploy"], "summary_length": "250 words" }</pre>
                            <p>סיכום פגישה מנהלים, חלוקת משימות אוטומטית (Action Items) ויצירת כרטיסים ישירות ב-Jira או Monday.</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (modalId === 'internal-agents') {
            detailsHtml = `
                <div class="modal-workflow-grid" style="direction: rtl; text-align: right;">
                    <div class="workflow-step-card input-card">
                        <div class="step-badge">קלט (Input)</div>
                        <div class="step-details">
                            <strong>שאילתה פנימית של עובד / בקשת פיתוח:</strong>
                            <pre class="step-preview-code LTR">Query: "Check liability limits in CISO Security Policy v2"</pre>
                            <p>עובד בארגון מבצע חיפוש מהיר של מדיניות CISO, מסמך HR או מדריך אינטגרציה טכנולוגי.</p>
                        </div>
                    </div>
                    <div class="workflow-step-card process-card">
                        <div class="step-badge">תהליך פנימי (VPC Workflow)</div>
                        <div class="step-details">
                            <strong>חיפוש וקטורי מאובטח (RAG):</strong>
                            <ul class="step-bullets">
                                <li>סוכן ה-AI מבצע חיפוש וקטורי (Vector Search) בבסיס הנתונים המקומי המאובטח</li>
                                <li>הצלבת המידע מול הגדרות הרשאה של העובד (RBAC Validation)</li>
                                <li>עיבוד מקומי וניסוח מענה מדויק ומבוסס מקורות ללא העלאת נתונים לרשת הציבורית</li>
                            </ul>
                        </div>
                    </div>
                    <div class="workflow-step-card output-card">
                        <div class="step-badge">פלט (Output)</div>
                        <div class="step-details">
                            <strong>מענה מנומק עם סימוכין:</strong>
                            <pre class="step-preview-code LTR" style="color: #10b981;">{ "source_verified": "CISO_v2.pdf", "compliance_checked": true }</pre>
                            <p>תשובה מקצועית, מדויקת ועמידה בנהלים, קישורים לפסקאות הרלוונטיות במסמכים המקוריים, וחסכון בזמן יקר של מנהלי הידע.</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (modalId === 'external-agents') {
            detailsHtml = `
                <div class="modal-workflow-grid" style="direction: rtl; text-align: right;">
                    <div class="workflow-step-card input-card">
                        <div class="step-badge">קלט (Input)</div>
                        <div class="step-details">
                            <strong>פניית לקוח קצה בערוצי השירות:</strong>
                            <pre class="step-preview-code LTR">Client: "Update shipping address for Order #9021 and open support ticket"</pre>
                            <p>פנייה של לקוח דרך הוואטסאפ, הצ'אט באתר או המייל בבקשה לביצוע פעולות קצה או פתרון תקלה.</p>
                        </div>
                    </div>
                    <div class="workflow-step-card process-card">
                        <div class="step-badge">תהליך פנימי (VPC Workflow)</div>
                        <div class="step-details">
                            <strong>אורקסטרציה ואימות זהות:</strong>
                            <ul class="step-bullets">
                                <li>בדיקה ואימות פרטי המשתמש מול ה-CRM ללא חשיפת פרטי PII</li>
                                <li>סוכן ה-AI מתחבר באמצעות APIs מאובטחים למערכת השילוח או ה-ERP לביצוע הפעולה המבוקשת</li>
                                <li>פתיחת כרטיס שירות ייעודי (Zendesk / ServiceNow) עם כל פרטי השיחה</li>
                            </ul>
                        </div>
                    </div>
                    <div class="workflow-step-card output-card">
                        <div class="step-badge">פלט (Output)</div>
                        <div class="step-details">
                            <strong>ביצוע פעולה ודיווח:</strong>
                            <pre class="step-preview-code LTR" style="color: #10b981;">{ "order_updated": true, "ticket_id": "SRV-9082" }</pre>
                            <p>הכתובת עודכנה בהצלחה ב-ERP, כרטיס שירות נפתח ב-ServiceNow, והודעת אישור נשלחה ללקוח באופן אוטומטי ומאובטח.</p>
                        </div>
                    </div>
                </div>
            `;
        }

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

// --- Agent Sandbox Playground Logic ---
let activePlaygroundPreset = 'ingest';
let isPlaygroundRunning = false;

window.selectPlaygroundPreset = function (presetId) {
    if (isPlaygroundRunning) return;
    activePlaygroundPreset = presetId;

    // Toggle active preset chip UI
    const chips = document.querySelectorAll('.preset-chip');
    chips.forEach(chip => {
        if (chip.id === `preset-${presetId}`) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    // Reset presentation stage to idle view or update workspace metadata based on preset selection
    const statusText = document.getElementById('stage-status-text');
    if (statusText) {
        if (presetId === 'ingest') {
            statusText.innerText = 'במה במצב משרת: ממתינה להפעלת קליטת מסמכים';
        } else if (presetId === 'cv') {
            statusText.innerText = 'במה במצב משרת: ממתינה להפעלת מיון קורות חיים';
        } else if (presetId === 'audit') {
            statusText.innerText = 'במה במצב משרת: ממתינה להפעלת בקרת חוזים';
        }
    }
};

window.startPlaygroundAnimation = function () {
    if (isPlaygroundRunning) return;
    isPlaygroundRunning = true;

    const startBtn = document.getElementById('playground-start-btn');
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerText = 'מריץ סימולציה...';
    }

    const idleView = document.getElementById('stage-idle-view');
    const activeElements = document.getElementById('stage-active-elements');
    const statusDot = document.getElementById('stage-status-dot');
    const statusText = document.getElementById('stage-status-text');

    if (idleView) idleView.style.display = 'none';
    if (activeElements) activeElements.style.display = 'block';
    if (statusDot) statusDot.style.background = '#3b82f6'; // running blue

    // Data depending on active preset
    let dataName = 'הסכם_לקוח.pdf';
    let dataCust = 'שלמה כהן';
    let dataVal = '54,000 ₪';
    let dataProd = 'חבילת Enterprise';
    let erpText = 'SAP ERP';
    let erpSubText = '✓ סונכרן מלאי';
    let crmText = 'Salesforce CRM';
    let crmSubText = '✓ הוקמה עסקה';
    let mailText = 'טיוטת מייל נשלחה למנהל!';

    if (activePlaygroundPreset === 'cv') {
        dataName = 'John_Doe_CV.pdf';
        dataCust = "ג'ון דו (DevOps)";
        dataVal = 'התאמה: 9.4/10';
        dataProd = 'Kubernetes, Terraform';
        erpText = 'HR Systems';
        erpSubText = '✓ נרשם מועמד';
        crmText = 'Comeet ATS';
        crmSubText = '✓ מסמך הועלה';
        mailText = 'פרופיל אנונימי נשלח לגיוס!';
    } else if (activePlaygroundPreset === 'audit') {
        dataName = 'חוזה_שירות_ספק.pdf';
        dataCust = "חברת גוגל בע\"מ";
        dataVal = 'חריגה: שיפוי';
        dataProd = 'הגבלת אחריות: מאושר';
        erpText = 'Vector Contract DB';
        erpSubText = '✓ סעיפים נסרקו';
        crmText = 'Legal Salesforce';
        crmSubText = '✓ חוזה עודכן';
        mailText = 'דוח חריגות מוכן לאישור!';
    }

    // Reset Elements
    gsap.set("#anim-pdf-doc", { opacity: 0, scale: 1, x: 0, y: 0 });
    gsap.set("#anim-scanner-chamber", { opacity: 0, scale: 0.8 });
    gsap.set("#anim-laser-sweep", { display: 'none', y: '0%' });
    gsap.set("#anim-robot-agent", { opacity: 0, scale: 0.8 });
    gsap.set("#anim-extracted-data", { opacity: 0, y: 20 });
    gsap.set("#anim-core-systems", { opacity: 0 });
    gsap.set("#system-box-sap", { scale: 1, borderColor: "var(--border-light)", background: "rgba(17, 24, 39, 0.85)" });
    gsap.set("#system-box-crm", { scale: 1, borderColor: "var(--border-light)", background: "rgba(17, 24, 39, 0.85)" });
    gsap.set("#anim-archive-cabinet", { opacity: 0, y: 20 });
    gsap.set("#anim-mail-envelope", { opacity: 0, scale: 0.5, x: 0, y: 0 });

    // Set texts dynamically
    const docNameEl = document.querySelector('#anim-pdf-doc span');
    if (docNameEl) docNameEl.innerText = dataName;

    const sapBoxTitle = document.querySelector('#system-box-sap span:nth-child(2)');
    const sapBoxSub = document.getElementById('sap-status-label');
    if (sapBoxTitle) sapBoxTitle.innerText = erpText;
    if (sapBoxSub) {
        sapBoxSub.innerText = 'ממתין לסנכרון';
        sapBoxSub.style.color = 'var(--text-muted)';
    }

    const crmBoxTitle = document.querySelector('#system-box-crm span:nth-child(2)');
    const crmBoxSub = document.getElementById('crm-status-label');
    if (crmBoxTitle) crmBoxTitle.innerText = crmText;
    if (crmBoxSub) {
        crmBoxSub.innerText = 'ממתין לעדכון';
        crmBoxSub.style.color = 'var(--text-muted)';
    }

    const mailTextEl = document.querySelector('#anim-mail-envelope span');
    if (mailTextEl) mailTextEl.innerText = mailText;

    // Reset Extracted Fields
    document.getElementById("extracted-cust-name").innerText = "-";
    document.getElementById("extracted-deal-val").innerText = "-";
    document.getElementById("extracted-prod-list").innerText = "-";

    const tl = gsap.timeline();

    // 1. Ingestion: Doc flies to Scanner Chamber
    if (statusText) statusText.innerText = 'במה במצב ריצה: קולט מסמך מקור מאובטח...';
    
    tl.to("#anim-scanner-chamber", { opacity: 1, scale: 1, duration: 0.6 })
      .to("#anim-pdf-doc", { opacity: 1, duration: 0.4 }, "-=0.2")
      .to("#anim-pdf-doc", { 
          x: "-220px", 
          y: "0px", 
          scale: 0.35, 
          opacity: 0.4, 
          rotation: 15, 
          duration: 1.3, 
          ease: "power2.inOut" 
      })
      .to("#anim-pdf-doc", { opacity: 0, duration: 0.2 })

      // 2. Scan & PII Masking & AI agent blinking
      .call(() => {
          if (statusText) statusText.innerText = 'במה במצב ריצה: סורק, מנתח ומנקה PII מקומית...';
          const laser = document.getElementById("anim-laser-sweep");
          if (laser) laser.style.display = "block";
      })
      .to("#anim-laser-sweep", { y: "160px", duration: 0.8, repeat: 1, yoyo: true })
      .to("#anim-robot-agent", { opacity: 1, scale: 1, duration: 0.6 }, "-=0.4")
      .call(() => {
          const laser = document.getElementById("anim-laser-sweep");
          if (laser) laser.style.display = "none";
      })
      .to(["#anim-eye-left", "#anim-eye-right"], { scaleY: 0.1, duration: 0.15, repeat: 3, yoyo: true, transformOrigin: "center" })
      .to("#anim-extracted-data", { opacity: 1, y: 0, duration: 0.6 })
      .call(() => {
          document.getElementById("extracted-cust-name").innerText = dataCust;
          document.getElementById("extracted-deal-val").innerText = dataVal;
          document.getElementById("extracted-prod-list").innerText = dataProd;
      })
      .to("#anim-robot-agent", { scale: 1.05, duration: 0.4, repeat: 1, yoyo: true })

      // 3. System Sync
      .call(() => {
          if (statusText) statusText.innerText = `במה במצב ריצה: מסנכרן ${erpText} ו-${crmText}...`;
      })
      .to("#anim-core-systems", { opacity: 1, duration: 0.6 })
      .to("#system-box-sap", { scale: 1.1, borderColor: "var(--primary)", duration: 0.5, repeat: 1, yoyo: true })
      .call(() => {
          if (sapBoxSub) {
              sapBoxSub.innerHTML = `<strong style="color: #10b981;">${erpSubText}</strong>`;
              document.getElementById("system-box-sap").style.borderColor = "#10b981";
              document.getElementById("system-box-sap").style.background = "rgba(16, 185, 129, 0.08)";
          }
      })
      .to("#system-box-crm", { scale: 1.1, borderColor: "var(--accent)", duration: 0.5, repeat: 1, yoyo: true })
      .call(() => {
          if (crmBoxSub) {
              crmBoxSub.innerHTML = `<strong style="color: #10b981;">${crmSubText}</strong>`;
              document.getElementById("system-box-crm").style.borderColor = "#10b981";
              document.getElementById("system-box-crm").style.background = "rgba(16, 185, 129, 0.08)";
          }
      })

      // 4. Archive original doc
      .call(() => {
          if (statusText) statusText.innerText = 'במה במצב ריצה: מארכב קובץ מקור ב-Secure VPC Archive...';
      })
      .to("#anim-archive-cabinet", { opacity: 1, y: 0, duration: 0.6 })
      .to("#anim-archive-cabinet", { scale: 1.1, duration: 0.4, yoyo: true, repeat: 1 })
      .call(() => {
          const cabinetIcon = document.getElementById("archive-cabinet-icon");
          if (cabinetIcon) cabinetIcon.innerText = "🗄️";
      })

      // 5. Done and fly mail out
      .call(() => {
          if (statusText) statusText.innerText = 'במה במצב ריצה: מנסח ומשגר דוח משתמש...';
      })
      .to("#anim-mail-envelope", { opacity: 1, scale: 1, duration: 0.6 })
      .to("#anim-mail-envelope", { x: "280px", y: "-180px", scale: 0.2, opacity: 0, duration: 1.3, ease: "power2.in" })
      .call(() => {
          if (statusDot) statusDot.style.background = '#10b981'; // green success
          if (statusText) statusText.innerText = 'משימה הושלמה בהצלחה!';
          
          if (startBtn) {
              startBtn.disabled = false;
              startBtn.innerText = 'הפעל סימולציה מונפשת';
          }
          isPlaygroundRunning = false;
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
        paybackDisp.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
    } else if (annualSavings > 750000) {
        paybackDisp.innerText = 'פחות מ-2 חודשים';
        paybackDisp.style.background = 'linear-gradient(135deg, #3b82f6, #60a5fa)';
    } else {
        paybackDisp.innerText = 'פחות מ-3 חודשים';
        paybackDisp.style.background = 'linear-gradient(135deg, #8b5cf6, #c084fc)';
    }
    paybackDisp.style.webkitBackgroundClip = 'text';
    paybackDisp.style.webkitTextFillColor = 'transparent';
};
