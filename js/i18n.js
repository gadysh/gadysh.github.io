/**
 * Lightweight bilingual engine for the PowOrg site.
 * No build step, no framework — a flat string dictionary for static text
 * (driven by data-i18n attributes) plus a small "content" dictionary for
 * text that JS builds at runtime (the conversational agent chat).
 *
 * Default language is English. Visitors can switch to Hebrew with the
 * toggle button in the navbar; the choice is remembered (localStorage)
 * and the page reloads in the chosen language.
 *
 * Copy source of truth: docs/marketing/2026-07-27_website_copy_he_en.md
 * (MKT-04/05, GitLab #40/#41). Every factual claim maps to the truth map
 * in docs/strategic_assets.md.
 */

const STORAGE_KEY = 'poworg-lang';

export const strings = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.process': 'How it works',
    'nav.events': 'What happened',
    'nav.department': 'The department',
    'nav.evidence': 'Evidence',
    'nav.contact': 'Ask us',
    'lang.toggle': 'HE',
    'lang.toggle.aria': 'Switch site language to Hebrew',
    // Legacy keys kept for the off-nav reference pages (pages/poc.html, pages/security.html)
    'nav.solutions': 'Solutions',
    'nav.team': 'Team',
    'nav.poc': 'Proof of capability',
    'nav.security': 'Security',

    // Hero
    'hero.badge': 'A real company · Run by AI · Human approval gates',
    'hero.title': 'We’re building a company that runs itself — and showing our work',
    'hero.subtitle': 'PowOrg is a real company operated by coordinated AI capabilities: a work queue, recorded decisions, and approval gates where a human decides. We’re not selling anything here — we’re documenting how it actually works, including what breaks along the way.',
    'hero.cta.primary': 'See how it works',
    'hero.cta.secondary': 'What actually happened',
    'hero.tech1': 'Every sensitive action stops for human approval',
    'hero.tech2': 'Failures are documented too',

    // How the company actually works (5 mechanism steps)
    'process.title': 'How the company actually works',
    'process.subtitle': 'Not magic, not chaos — a mechanism you can inspect.',
    'process.step1.title': 'Work enters a queue',
    'process.step1.body': 'Every task is a recorded item with a goal, a definition of done, and stop rules.',
    'process.step2.title': 'The right capability claims it',
    'process.step2.body': 'Not a fixed "employee" but an expertise pack loaded per task, with a time-boxed lease so nothing gets stuck.',
    'process.step3.title': 'Decisions are recorded',
    'process.step3.body': 'Every significant call goes into a decision log with its rationale.',
    'process.step4.title': 'Sensitive actions stop',
    'process.step4.body': 'Publishing, money, deletion, or external commitments halt and wait for explicit human approval.',
    'process.step5.title': 'Outcome and evidence are kept',
    'process.step5.body': 'Every session closes into an archive; failures get a retro. That’s how the company learns.',

    // What actually happened (three verified events)
    'events.title': 'What actually happened',
    'events.subtitle': 'Three real events from the past month — a breakdown, a gated decision, and a self-correction.',
    'events.card1.title': 'The week the infrastructure broke',
    'events.card1.body': 'July 2026: the account hosting our work queue was suspended, paralyzing the company’s ability to coordinate work. The organization moved to a new provider, restored its mechanisms, and wrote a retrospective. The lesson: recovery is a capability, not luck.',
    'events.card2.title': 'The decision that waited for a human',
    'events.card2.body': '19 July: the provider cutover was technically ready days earlier, but did not execute until the founder pasted an explicit approval sentence. That’s what an authority gate looks like in practice: the system prepares everything; the human decides.',
    'events.card3.title': 'The marketing that stopped itself',
    'events.card3.body': '25 July: the marketing capability audited the company’s public assets and found them telling an outdated story. Instead of publishing, it stopped, documented the gap, and built a realignment plan. This site is the result.',

    // From company to department
    'department.title': 'From a company to a department',
    'department.body1': 'The same mechanism that runs PowOrg — a defined outcome, a work queue, clear authority, approval points, and measurement — is currently being packaged as a bounded department an organization could adopt. Not a "company in a box" and not another AI tool: one department, with clear limits, that works and asks permission.',
    'department.body2': 'This is a direction under examination, not a commercial offer — there is no price, no commitment, and no customer yet. When that changes, it will be published here.',

    // What the human still does
    'human.title': 'What the human still does',
    'human.body1': 'The founder is currently the link to the physical world, and exclusively holds what must not be delegated: setting direction, money, publishing, external commitments, deleting data — and judgment in cases no one anticipated.',
    'human.body2': 'The names and characters in our communications are a convenient presentation layer; behind them, identity-free professional capabilities are loaded per task.',

    // Evidence & limits
    'evidence.title': 'Evidence and limits',
    'evidence.subtitle': 'What’s live, what’s being built, and what we haven’t proven — honestly.',
    'evidence.live.title': 'Live today',
    'evidence.live.body': 'A work queue with task claiming; founder approval gates; a decision log and session archive; failure retrospectives; this bilingual site.',
    'evidence.building.title': 'In progress',
    'evidence.building.body': 'A public transparency surface (published only with real data and an exposure filter); the department-as-a-service packaging.',
    'evidence.notyet.title': 'Not yet proven',
    'evidence.notyet.body': 'A paying external customer; revenue; sustained operation without the founder’s involvement. We don’t claim otherwise.',
    'evidence.history.title': 'History',
    'evidence.history.body': 'In an earlier era we built and proved an enterprise document-processing engine (D2A) and related capabilities. They are preserved as frozen proof of capability and are not our offer.',

    // Follow / ask (contact)
    'contact.title': 'Want to follow along?',
    'contact.subtitle': 'We publish the journey — results, failures, and lessons — on PowOrg’s LinkedIn page. You can also ask us directly here: your question goes to Gadi, the human founder. We’re not selling, won’t book a "fit call," and won’t ask for budget.',
    'contact.linkedin': 'PowOrg on LinkedIn →',
    'agent.name': 'Poppy',
    'agent.role': 'Conversational assistant (AI)',
    'agent.input.placeholder': 'Ask about the process...',

    // Footer
    'footer.copy': '© 2026 PowOrg. All rights reserved.',
    'footer.contact': 'Ask us',
    'footer.security': 'Security',

    // Sub-pages (poc.html / security.html) — legacy reference pages, off the main nav
    'page.poc.title': 'PowOrg’s pilot project',
    'page.poc.desc': 'How PowOrg proves real, measurable value in your organization in 6-8 weeks, before any full commitment.',
    'page.poc.h1': 'PowOrg’s pilot project',
    'page.poc.lead': 'From idea to working software: a tailored pilot that proves technical feasibility, shows a real integration, and estimates real ROI within 6 to 8 weeks.',
    'page.poc.cta.title': 'Want to check if this fits your organization?',
    'page.poc.cta.body': 'We’re happy to have a no-obligation conversation, map your process, and put together a focused pilot plan.',
    'page.poc.cta.primary': 'Go to the contact form',
    'page.poc.cta.secondary': 'Talk to our CEO now',
    'page.security.title': 'Security & privacy',
    'page.security.desc': 'Security, privacy, and control in PowOrg’s AI solutions: permissions, logging, encryption, and hybrid or on-premises deployment.',
    'page.security.h1': 'Security & privacy',
    'page.security.lead': 'Your data stays with you. The principles below explain how we connect AI to your processes without giving up control, traceability, or compliance.',
    'page.security.cta.title': 'Want a focused technical security review?',
    'page.security.cta.body': 'We’re happy to walk through this against your organization’s own policy, and flag risk and control points as early as the pilot stage.',
    'page.security.cta.primary': 'Go to the contact form',
    'page.security.cta.secondary': 'Talk to our CEO now',
    'page.footer.rights': '© 2026 PowOrg. All rights reserved.',
    'page.footer.security': 'Security & privacy',
    'page.footer.poc': 'Pilot project',
  },

  he: {
    'nav.home': 'בית',
    'nav.process': 'איך זה עובד',
    'nav.events': 'מה קרה באמת',
    'nav.department': 'המחלקה',
    'nav.evidence': 'ראיות',
    'nav.contact': 'שאלו אותנו',
    'lang.toggle': 'EN',
    'lang.toggle.aria': 'החלפת שפת האתר לאנגלית',
    'nav.solutions': 'פתרונות',
    'nav.team': 'הצוות',
    'nav.poc': 'הוכחת יכולת',
    'nav.security': 'אבטחה',

    'hero.badge': 'חברה אמיתית · מופעלת על ידי AI · בשערי אישור אנושיים',
    'hero.title': 'אנחנו בונים חברה שיודעת לעבוד לבד — ומראים את הדרך',
    'hero.subtitle': 'PowOrg היא חברה אמיתית שמופעלת על ידי יכולות AI מתואמות: תור עבודה, החלטות מתועדות, ושערי אישור שבהם אדם מכריע. אנחנו לא מוכרים כאן כלום — אנחנו מתעדים איך זה עובד בפועל, כולל מה שנשבר בדרך.',
    'hero.cta.primary': 'איך זה עובד',
    'hero.cta.secondary': 'מה קרה באמת',
    'hero.tech1': 'כל פעולה רגישה נעצרת לאישור אנושי',
    'hero.tech2': 'גם הכישלונות מתועדים ומתפרסמים',

    'process.title': 'איך החברה באמת עובדת',
    'process.subtitle': 'לא קסם ולא כאוס — מנגנון שאפשר לבדוק.',
    'process.step1.title': 'עבודה נכנסת לתור',
    'process.step1.body': 'כל משימה היא פריט מתועד עם יעד, הגדרת סיום וכללי עצירה.',
    'process.step2.title': 'יכולת מתאימה תובעת אותה',
    'process.step2.body': 'לא "עובד" קבוע אלא חבילת מומחיות שנטענת לפי העבודה, עם חוזה־זמן שמונע נעילה.',
    'process.step3.title': 'החלטות נרשמות',
    'process.step3.body': 'כל הכרעה משמעותית נכנסת ליומן החלטות עם הרציונל שלה.',
    'process.step4.title': 'פעולה רגישה נעצרת',
    'process.step4.body': 'פרסום, כסף, מחיקה או התחייבות חיצונית עוצרים ומחכים לאישור אנושי מפורש.',
    'process.step5.title': 'תוצאה וראיה נשמרות',
    'process.step5.body': 'כל סשן נסגר בארכיון; תקלות מקבלות תחקיר. ככה החברה לומדת.',

    'events.title': 'מה קרה באמת',
    'events.subtitle': 'שלושה אירועים אמיתיים מהחודש האחרון — שבר, החלטה שנעצרה, ותיקון עצמי.',
    'events.card1.title': 'השבוע שבו התשתית נשברה',
    'events.card1.body': 'יולי 2026: החשבון שאירח את תור העבודה שלנו הושעה, ולמעשה שיתק את יכולת החברה לתאם עבודה. הארגון עבר לספק חדש, שחזר את המנגנונים וכתב תחקיר. הלקח: התאוששות היא יכולת, לא מזל.',
    'events.card2.title': 'ההחלטה שחיכתה לאדם',
    'events.card2.body': '19 ביולי: מעבר הספק היה מוכן טכנית ימים קודם, אבל לא בוצע עד שהמייסד הדביק משפט אישור מפורש. ככה נראה שער סמכות בפועל: המערכת מכינה הכול, האדם מכריע.',
    'events.card3.title': 'השיווק שעצר את עצמו',
    'events.card3.body': '25 ביולי: יכולת השיווק בדקה את הנכסים הציבוריים של החברה ומצאה שהם מספרים סיפור ישן. במקום לפרסם — היא עצרה, תיעדה את הפער ובנתה תוכנית יישור. האתר הזה הוא התוצאה.',

    'department.title': 'מחברה למחלקה',
    'department.body1': 'אותו מנגנון שמפעיל את PowOrg — תוצאה מוגדרת, תור עבודה, סמכויות ברורות, נקודות אישור ומדידה — נארז בימים אלה כמחלקה תחומה שארגון יכול לאמץ. לא "חברה בקופסה" ולא עוד כלי AI: מחלקה אחת, עם גבולות ברורים, שעובדת ומבקשת רשות.',
    'department.body2': 'זה כיוון בבחינה, לא הצעה מסחרית — אין מחיר, אין התחייבות, ואין לקוח עדיין. כשזה ישתנה, זה יפורסם כאן.',

    'human.title': 'מה האדם עדיין עושה',
    'human.body1': 'המייסד הוא כיום החוליה המקשרת לעולם הפיזי, ומחזיק בבלעדיות את מה שאסור להאציל: קביעת כיוון, כסף, פרסום, התחייבויות חיצוניות, מחיקת מידע — ושיקול הדעת במקרים שלא נצפו מראש.',
    'human.body2': 'השמות והדמויות שמופיעים בתקשורת שלנו הם שכבת הצגה נוחה; מאחוריהם עובדות יכולות מקצועיות נטולות־זהות שנטענות לפי העבודה.',

    'evidence.title': 'ראיות ומגבלות',
    'evidence.subtitle': 'מה חי, מה בבנייה, ומה עוד לא הוכחנו — בכנות.',
    'evidence.live.title': 'חי היום',
    'evidence.live.body': 'תור עבודה ותביעת משימות; שערי אישור מייסד; יומן החלטות וארכיון סשנים; תחקירי תקלה; האתר הדו־לשוני הזה.',
    'evidence.building.title': 'בבנייה',
    'evidence.building.body': 'משטח שקיפות ציבורי (יפורסם רק עם נתונים אמיתיים ומסנן חשיפה); אריזת "מחלקה כשירות".',
    'evidence.notyet.title': 'עוד לא הוכח',
    'evidence.notyet.body': 'לקוח חיצוני משלם; הכנסות; פעולה רציפה ללא ליווי המייסד. אנחנו לא טוענים אחרת.',
    'evidence.history.title': 'היסטוריה',
    'evidence.history.body': 'בעידן קודם בנינו והוכחנו מנוע עיבוד מסמכים ארגוני (D2A) ויכולות נלוות. הם שמורים כהוכחת יכולת מוקפאת ואינם ההצעה שלנו.',

    'contact.title': 'רוצים לעקוב?',
    'contact.subtitle': 'אנחנו מפרסמים את הדרך — הישגים, תקלות ולקחים — בדף ה־LinkedIn של PowOrg. אפשר גם לשאול אותנו ישירות כאן: השאלה מגיעה לגדי, המייסד האנושי. אנחנו לא מוכרים, לא קובעים "שיחת התאמה" ולא נבקש תקציב.',
    'contact.linkedin': 'PowOrg ב־LinkedIn ←',
    'agent.name': 'פופי',
    'agent.role': 'עוזרת שיחה (AI)',
    'agent.input.placeholder': 'שאלו על התהליך...',

    'footer.copy': '&copy; 2026 PowOrg. כל הזכויות שמורות.',
    'footer.contact': 'שאלו אותנו',
    'footer.security': 'אבטחה',

    'page.poc.title': 'הפיילוט של PowOrg',
    'page.poc.desc': 'איך PowOrg מוכיחה ערך אמיתי ומדיד בארגון שלכם תוך 6-8 שבועות, לפני כל התחייבות מלאה.',
    'page.poc.h1': 'הפיילוט של PowOrg',
    'page.poc.lead': 'מרעיון לתוכנה עובדת: פיילוט מותאם אישית שמוכיח היתכנות טכנולוגית, מציג אינטגרציה אמיתית ומחשב תשואה על ההשקעה תוך 6 עד 8 שבועות.',
    'page.poc.cta.title': 'רוצים לבדוק אם זה מתאים לארגון שלכם?',
    'page.poc.cta.body': 'נשמח לקיים שיחה ללא התחייבות, למפות את התהליך ולבנות תוכנית פיילוט ממוקדת.',
    'page.poc.cta.primary': 'עברו לטופס יצירת קשר',
    'page.poc.cta.secondary': 'דברו עם המנכ"לית שלנו עכשיו',
    'page.security.title': 'אבטחה ופרטיות',
    'page.security.desc': 'אבטחה, פרטיות ושליטה בפתרונות ה-AI של PowOrg: הרשאות, לוגים, הצפנה ופריסה היברידית או מקומית.',
    'page.security.h1': 'אבטחה ופרטיות',
    'page.security.lead': 'המידע שלכם נשאר אצלכם. העקרונות הבאים מסבירים איך אנחנו מחברים AI לתהליכים שלכם בלי לוותר על שליטה, מעקב וציות.',
    'page.security.cta.title': 'רוצים סקירת אבטחה טכנית וממוקדת?',
    'page.security.cta.body': 'נשמח לעבור על זה מול המדיניות של הארגון שלכם, ולסמן נקודות סיכון ובקרה כבר בשלב הפיילוט.',
    'page.security.cta.primary': 'עברו לטופס יצירת קשר',
    'page.security.cta.secondary': 'דברו עם המנכ"לית שלנו עכשיו',
    'page.footer.rights': '&copy; 2026 PowOrg. כל הזכויות שמורות.',
    'page.footer.security': 'אבטחה ופרטיות',
    'page.footer.poc': 'הפיילוט',
  },
};

// --- Structured content JS builds at runtime (the conversational agent chat) ---
// The old use-case catalog was removed from the main path (MKT-05); main.js guards
// on the gallery element's absence, and an empty list keeps its module-level read safe.

export const content = {
  en: {
    useCases: [],
    chat: {
      welcome: 'Hi! I’m Poppy, one of the AI capabilities that run PowOrg. You can ask me how this company actually works.',
      askName: 'What’s your name?',
      namePlaceholder: 'Type your name...',
      greet: (name) => `Nice to meet you, ${name}! Which organization are you from? (It’s fine to skip — just type "-")`,
      orgPlaceholder: 'Your company or organization (optional)...',
      askEmail: 'If you’d like a personal answer from Gadi, our human founder, what email should he reply to?',
      emailPlaceholder: 'Your email address...',
      emailInvalid: 'That doesn’t look like a valid email. Could you check it?',
      askProcess: 'What would you like to ask about?',
      quickOptions: [
        'How do the approval gates work?',
        'What happens when something breaks?',
        'What is "a department as a service"?',
        'Something else (I’ll type it)',
      ],
      quickOptionsPlaceholder: 'Pick a question or type your own...',
      askFreeText: 'Go ahead — ask in your own words. Honest questions and hard questions are both welcome.',
      freeTextPlaceholder: 'Your question...',
      processing: (name) => `Thanks, ${name}. Passing this along...`,
      matchFound: 'I’m sending your question to Gadi, our human founder. You’ll get a real answer, not an automated one.',
      followUp: 'He usually replies within a business day. You can also follow the journey on our LinkedIn page.',
      successToastTitle: 'Thanks, that came through!',
      successToastBody: 'Gadi will get back to you with a real answer.',
      submitError: 'There was a small hiccup sending this to our server. No worries — you can also reach us directly at gadi@poworg.com.',
      subjectPrefix: 'New question from PowOrg website',
    },
  },

  he: {
    useCases: [],
    chat: {
      welcome: 'שלום! אני פופי, אחת מיכולות ה-AI שמפעילות את PowOrg. אפשר לשאול אותי איך החברה הזאת באמת עובדת.',
      askName: 'איך קוראים לך?',
      namePlaceholder: 'השם שלך...',
      greet: (name) => `נעים להכיר, ${name}! מאיזה ארגון? (אפשר לדלג — פשוט הקלידו "-")`,
      orgPlaceholder: 'שם החברה או הארגון (לא חובה)...',
      askEmail: 'אם תרצו תשובה אישית מגדי, המייסד האנושי שלנו — לאיזה אימייל לחזור אליכם?',
      emailPlaceholder: 'כתובת אימייל...',
      emailInvalid: 'זה לא נראה כמו אימייל תקין. אפשר לבדוק שוב?',
      askProcess: 'על מה תרצו לשאול?',
      quickOptions: [
        'איך שערי האישור עובדים?',
        'מה קורה כשמשהו נשבר?',
        'מה זו "מחלקה כשירות"?',
        'משהו אחר (אקליד בעצמי)',
      ],
      quickOptionsPlaceholder: 'בחרו שאלה או הקלידו משלכם...',
      askFreeText: 'קדימה — שאלו במילים שלכם. שאלות כנות ושאלות קשות מתקבלות באותה שמחה.',
      freeTextPlaceholder: 'השאלה שלכם...',
      processing: (name) => `תודה, ${name}. מעבירה את זה הלאה...`,
      matchFound: 'אני מעבירה את השאלה לגדי, המייסד האנושי שלנו. תקבלו תשובה אמיתית, לא אוטומטית.',
      followUp: 'הוא בדרך כלל עונה תוך יום עסקים. אפשר גם לעקוב אחרי הדרך בדף ה-LinkedIn שלנו.',
      successToastTitle: 'תודה, זה התקבל!',
      successToastBody: 'גדי יחזור אליכם עם תשובה אמיתית.',
      submitError: 'הייתה תקלה קטנה בשליחה לשרת. אל דאגה — אפשר גם לפנות אלינו ישירות בכתובת gadi@poworg.com.',
      subjectPrefix: 'שאלה חדשה מאתר PowOrg',
    },
  },
};

export function getLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'he' || stored === 'en' ? stored : 'en';
}

export function t(key) {
  const lang = getLang();
  const dict = strings[lang] || strings.en;
  return dict[key] !== undefined ? dict[key] : (strings.en[key] !== undefined ? strings.en[key] : key);
}

export function getContent() {
  const lang = getLang();
  return content[lang] || content.en;
}

/** Apply the current language to every [data-i18n*] element and <html> attrs. Runs once per page load. */
export function applyStaticText() {
  const lang = getLang();
  const dict = strings[lang] || strings.en;

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  document.body.classList.toggle('lang-he', lang === 'he');
  document.body.classList.toggle('lang-en', lang === 'en');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
  });

  const toggleBtn = document.getElementById('lang-toggle-btn');
  if (toggleBtn) {
    toggleBtn.textContent = dict['lang.toggle'];
    toggleBtn.setAttribute('aria-label', dict['lang.toggle.aria']);
  }
}

/** Wires the navbar language toggle. Switching reloads the page — the simplest way to keep
 *  every JS-rendered piece (chat, cards, labels) consistently in one language. */
export function initLangToggle() {
  applyStaticText();
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = getLang() === 'en' ? 'he' : 'en';
      localStorage.setItem(STORAGE_KEY, next);
      location.reload();
    });
  }
}
