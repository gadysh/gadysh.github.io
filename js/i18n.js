/**
 * Lightweight bilingual engine for the PowOrg site.
 * No build step, no framework — a flat string dictionary for static text
 * (driven by data-i18n attributes) plus a small "content" dictionary for
 * text that JS builds at runtime (use-case cards, the intake agent chat).
 *
 * Default language is English. Visitors can switch to Hebrew with the
 * toggle button in the navbar; the choice is remembered (localStorage)
 * and the page reloads in the chosen language — simplest way to keep
 * every dynamically-built piece of the page (chat, cards, ROI numbers)
 * consistently in one language without a templating layer.
 */

const STORAGE_KEY = 'poworg-lang';

export const strings = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.process': 'How it works',
    'nav.solutions': 'Solutions',
    'nav.team': 'Team',
    'nav.poc': 'Pilot project',
    'nav.security': 'Security',
    'nav.contact': 'Talk to our CEO',
    'lang.toggle': 'HE',
    'lang.toggle.aria': 'Switch site language to Hebrew',

    // Hero
    'hero.badge': 'Human-approved automation · runs on your own systems',
    'hero.title': 'Documents in. Approved action out.',
    'hero.subtitle': 'PowOrg turns your everyday business documents into approved actions inside the systems you already use, with a person checking every important step.',
    'hero.cta.primary': 'Check your fit now',
    'hero.cta.secondary': 'See how it works',
    'hero.tech1': 'Connects to the CRM, ERP, and databases you already use',
    'hero.tech2': 'Runs on your own infrastructure, with human approval built in',

    // Problem / Solution / Promise strip
    'problem.title': 'The problem we solve',
    'problem.body': 'Growing teams process hundreds of documents, invoices, and calls by hand every day. Every manual entry is a delay, every mistake has a cost, and a lot of the AI tools on the market live in someone else’s cloud, outside your control.',
    'solution.title': 'Our solution',
    'solution.body': 'Document-to-Action (D2A) connects AI to the documents and processes you already run. It works on your own infrastructure, and a person always checks the result before anything is written back to your systems.',
    'promise.title': 'Our promise',
    'promise.body': 'We don’t sell pilots that quietly disappear. Every project starts with plain, agreed success criteria, so you know exactly what "done" looks like before we start building.',
    'strip.cta': 'Talk to our CEO now',

    // Fit / value section (replaces the old role-tabbed "personas" block)
    'fit.title': 'Built to fit how you already work',
    'fit.subtitle': 'Three simple things that matter, whatever your role.',
    'fit.card1.title': 'A clear, agreed payoff',
    'fit.card1.body': 'We agree on what success looks like, and how we’ll measure it, before any work starts. No surprise scope, no vague promises.',
    'fit.card2.title': 'Your data stays yours',
    'fit.card2.body': 'Everything runs inside your own network. Nothing is written back to your CRM, ERP, or databases without a person approving it first.',
    'fit.card3.title': 'Fits your existing systems',
    'fit.card3.body': 'We connect to the tools you already use instead of asking you to replace them, so your team keeps working the way it already knows.',
    'fit.cta': 'Check your fit now',

    // Process / how it works
    'process.title': 'How it works: three simple steps, and you’re always in control',
    'process.subtitle': 'Nothing goes live without your sign-off. No surprises along the way.',
    'process.step1.title': 'Step 1 · We learn your process',
    'process.step1.body': 'We sit down together, pick one process that’s costing you real time, and agree in plain terms what success looks like before anything is built.',
    'process.step2.title': 'Step 2 · We build it on your real data',
    'process.step2.body': 'We build and test the solution on your actual documents and systems, not a generic demo, so what you see is what you’ll actually get.',
    'process.step3.title': 'Step 3 · You approve before it goes live',
    'process.step3.body': 'Nothing writes back to your systems until your team signs off on accuracy and results. That approval is our commitment to you, not an afterthought.',
    'process.link': 'More about how a pilot project runs',

    // Tech strip
    'tech.label': 'Built on proven cloud and AI infrastructure',

    // Use cases
    'usecases.title': 'Solutions already at work',
    'usecases.subtitle': 'Each one is a Document-to-Action solution that runs inside your organization’s own network.',
    'usecases.readmore': 'Read more',
    'usecases.cta': 'Not sure which one fits you? ',
    'usecases.cta.link': 'Talk to our CEO now →',
    'usecase.modal.challenge': 'The challenge',
    'usecase.modal.solution': 'The solution',
    'usecase.modal.cta': 'Book a scoping call',

    // Trust / security section (homepage)
    'trust.title': 'A secure setup, with full visibility into your data',
    'trust.body': 'PowOrg’s assistants run directly inside your organization’s own network. No business data is stored in an outside cloud or used to train any model.',
    'trust.heading': 'A protective layer around your company’s information',
    'trust.item1': 'PowOrg is built for organizations that put data control and security first.',
    'trust.item2': 'Every AI assistant and component runs inside your organization’s own network (on your own servers or a private cloud you control).',
    'trust.item3': 'The system connects securely to your internal systems (ERP, CRM, databases) without sensitive data ever leaving your network.',
    'trust.item4': 'The only outside connection is a secure, encrypted link to the language model itself, with zero data retention, meaning your information is never used to train external models.',
    'trust.item5': 'A general and per-assistant kill switch lets you stop any activity immediately, whenever you need to.',
    'trust.link': 'Read the full security overview →',
    'trust.cta': 'Talk to our CEO now',

    // ROI calculator
    'roi.title': 'Estimate the potential savings for your organization',
    'roi.subtitle': 'Enter rough numbers to get an initial estimate. We’ll review and agree on the real numbers together before any project starts.',
    'roi.params.title': 'Your organization, roughly',
    'roi.employees': 'People doing manual, repetitive work:',
    'roi.hours': 'Average hours per week on that work:',
    'roi.wage': 'Average hourly cost (incl. overhead):',
    'roi.auto': 'Share of the work you’d want automated:',
    'roi.savings.label': 'Estimated annual savings',
    'roi.savings.desc': 'Based on the working hours this would free up',
    'roi.hours.label': 'Working hours saved per year',
    'roi.hours.desc': 'Time your team could spend on higher-value work',
    'roi.hours.unit': 'hours',
    'roi.payback.label': 'Estimated payback period',
    'roi.payback.desc': 'For building and rolling out the first pilot',
    'roi.payback.fast': 'Under 4 weeks',
    'roi.payback.mid': 'Under 2 months',
    'roi.payback.slow': 'Under 3 months',

    // Team
    'team.title': 'The team running PowOrg',
    'team.body': 'Behind the platform is a team of AI teammates, each specialized in their own area, working transparently and with human oversight. It’s a living example of the controlled automation we bring to your organization.',
    'team.poppy.name': 'Poppy',
    'team.poppy.role': 'CEO',
    'team.poppy.bio': 'Strategy, direction, and leadership.',
    'team.maya.name': 'Maya',
    'team.maya.role': 'VP People & Operations',
    'team.maya.bio': 'Process, people, and quality.',
    'team.mark.name': 'Mark',
    'team.mark.role': 'Marketing & Content Lead',
    'team.mark.bio': 'Content, brand, and voice.',
    'team.dave.name': 'Dave',
    'team.dave.role': 'CTO / Lead Architect',
    'team.dave.bio': 'Architecture, performance, and security.',
    'team.gadi.name': 'Gadi',
    'team.gadi.role': 'Founder',
    'team.gadi.bio': 'Vision, direction, and momentum.',

    // Contact / intake agent
    'contact.title': 'Let’s talk',
    'contact.subtitle': 'A short, no-obligation conversation. We’ll understand what you need and check if there’s a fit.',
    'agent.name': 'Poppy (AI CEO)',
    'agent.role': 'Autonomous intake assistant',
    'agent.input.placeholder': 'Start a conversation with Poppy...',

    // Footer
    'footer.copy': '© 2026 PowOrg. All rights reserved.',
    'footer.security': 'Security',
    'footer.contact': 'Talk to our CEO',

    // Sub-pages (poc.html / security.html) shared chrome
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
    'nav.solutions': 'פתרונות',
    'nav.team': 'הצוות',
    'nav.poc': 'פיילוט',
    'nav.security': 'אבטחה',
    'nav.contact': 'דברו עם המנכ"לית',
    'lang.toggle': 'EN',
    'lang.toggle.aria': 'החלפת שפת האתר לאנגלית',

    'hero.badge': 'אוטומציה עם אישור אנושי · פועלת על התשתיות שלכם',
    'hero.title': 'מסמך נכנס. פעולה מאושרת יוצאת.',
    'hero.subtitle': 'PowOrg הופכת את המסמכים העסקיים היומיומיים שלכם לפעולות מאושרות במערכות שאתם כבר משתמשים בהן, כשאדם בודק כל שלב חשוב בדרך.',
    'hero.cta.primary': 'בדקו התאמה עכשיו',
    'hero.cta.secondary': 'ראו איך זה עובד',
    'hero.tech1': 'מתחברת ל-CRM, ERP ובסיסי הנתונים שכבר יש לכם',
    'hero.tech2': 'פועלת על התשתית שלכם, עם אישור אנושי מובנה',

    'problem.title': 'הבעיה שאנחנו פותרים',
    'problem.body': 'צוותים גדלים מעבדים מדי יום מאות מסמכים, חשבוניות ושיחות באופן ידני. כל הקלדה היא עיכוב, כל טעות עולה כסף, והרבה מכלי ה-AI בשוק פשוט יושבים בענן של מישהו אחר, מחוץ לשליטתכם.',
    'solution.title': 'הפתרון שלנו',
    'solution.body': 'Document-to-Action (D2A) מחברת AI למסמכים ולתהליכים שכבר יש לכם. היא פועלת על התשתית שלכם, ואדם תמיד בודק את התוצאה לפני שהיא נכתבת בחזרה למערכות שלכם.',
    'promise.title': 'ההבטחה שלנו',
    'promise.body': 'אנחנו לא מוכרים פיילוטים שנעלמים בשקט. כל פרויקט מתחיל בקריטריוני הצלחה ברורים ומוסכמים, כך שאתם יודעים בדיוק איך נראית "הצלחה" עוד לפני שמתחילים לבנות.',
    'strip.cta': 'דברו עם המנכ"לית שלנו עכשיו',

    'fit.title': 'בנוי כדי להתאים לאופן שבו אתם כבר עובדים',
    'fit.subtitle': 'שלושה דברים פשוטים שחשובים, לא משנה מה התפקיד שלכם.',
    'fit.card1.title': 'תמורה ברורה ומוסכמת מראש',
    'fit.card1.body': 'קובעים ביחד איך נראית הצלחה, ואיך מודדים אותה, עוד לפני שמתחילים בעבודה. בלי היקף שמתרחב בהפתעה ובלי הבטחות מעורפלות.',
    'fit.card2.title': 'המידע שלכם נשאר שלכם',
    'fit.card2.body': 'הכל פועל בתוך הרשת שלכם. שום דבר לא נכתב חזרה ל-CRM, ל-ERP או לבסיסי הנתונים שלכם בלי שאדם אישר את זה קודם.',
    'fit.card3.title': 'מתאים למערכות שכבר יש לכם',
    'fit.card3.body': 'אנחנו מתחברים לכלים שאתם כבר עובדים איתם במקום לבקש מכם להחליף אותם, כך שהצוות שלכם ממשיך לעבוד בדרך שהוא כבר מכיר.',
    'fit.cta': 'בדקו התאמה עכשיו',

    'process.title': 'איך זה עובד: שלושה שלבים פשוטים, ואתם תמיד בשליטה',
    'process.subtitle': 'שום דבר לא עולה לאוויר בלי האישור שלכם. בלי הפתעות בדרך.',
    'process.step1.title': 'שלב 1 · אנחנו לומדים את התהליך שלכם',
    'process.step1.body': 'יושבים ביחד, בוחרים תהליך אחד שגוזל לכם זמן אמיתי, וקובעים במילים פשוטות איך נראית הצלחה עוד לפני שבונים משהו.',
    'process.step2.title': 'שלב 2 · בונים על הנתונים האמיתיים שלכם',
    'process.step2.body': 'בונים ובודקים את הפתרון על המסמכים והמערכות האמיתיים שלכם, לא על דמו כללי, כך שמה שאתם רואים זה בדיוק מה שתקבלו.',
    'process.step3.title': 'שלב 3 · אתם מאשרים לפני שזה עולה לאוויר',
    'process.step3.body': 'שום דבר לא נכתב חזרה למערכות שלכם עד שהצוות שלכם מאשר דיוק ותוצאות. האישור הזה הוא ההתחייבות שלנו כלפיכם, לא פרט טכני שנעלם בדרך.',
    'process.link': 'עוד על איך פיילוט מתנהל',

    'tech.label': 'בנוי על תשתית AI וענן מוכחת',

    'usecases.title': 'תרחישים שכבר עובדים',
    'usecases.subtitle': 'כל אחד מהם הוא פתרון D2A שרץ בתוך הרשת של הארגון עצמו.',
    'usecases.readmore': 'קראו עוד',
    'usecases.cta': 'לא בטוחים מה מתאים לכם? ',
    'usecases.cta.link': 'דברו עם המנכ"לית שלנו עכשיו ←',
    'usecase.modal.challenge': 'האתגר',
    'usecase.modal.solution': 'הפתרון',
    'usecase.modal.cta': 'קבעו שיחת אפיון',

    'trust.title': 'תשתית מאובטחת, עם שקיפות מלאה על הנתונים שלכם',
    'trust.body': 'הסוכנים של PowOrg רצים ישירות בתוך הרשת של הארגון שלכם. שום מידע עסקי לא נשמר בענן חיצוני ולא משמש לאימון מודלים.',
    'trust.heading': 'שכבת הגנה סביב המידע של החברה שלכם',
    'trust.item1': 'PowOrg בנויה עבור ארגונים ששליטה על הנתונים ואבטחת מידע הם עבורם עדיפות ראשונה.',
    'trust.item2': 'כל סוכן AI ורכיב פועל בתוך הרשת של הארגון שלכם (על השרתים שלכם או בענן פרטי שאתם שולטים בו).',
    'trust.item3': 'המערכת מתחברת בצורה מאובטחת למערכות הפנימיות שלכם (ERP, CRM, בסיסי נתונים) בלי שמידע רגיש יוצא מהרשת שלכם.',
    'trust.item4': 'החיבור החיצוני היחיד הוא ערוץ מוצפן ומאובטח אל מודל השפה עצמו, ללא שמירת מידע, כלומר המידע שלכם לעולם לא משמש לאימון מודלים חיצוניים.',
    'trust.item5': 'מתג עצירה כללי ופר-סוכן מאפשר לכם לעצור כל פעילות מיידית, בכל רגע שתרצו.',
    'trust.link': 'קראו את סקירת האבטחה המלאה ←',
    'trust.cta': 'דברו עם המנכ"לית שלנו עכשיו',

    'roi.title': 'הערכת פוטנציאל החיסכון לארגון שלכם',
    'roi.subtitle': 'הזינו נתונים משוערים לקבלת אומדן ראשוני. נבחן ונסכם את המספרים האמיתיים יחד לפני כל פרויקט.',
    'roi.params.title': 'הארגון שלכם, בגדול',
    'roi.employees': 'אנשים שעושים עבודה ידנית וחוזרת:',
    'roi.hours': 'שעות שבועיות ממוצעות על העבודה הזו:',
    'roi.wage': 'עלות שעתית ממוצעת (כולל תקורה):',
    'roi.auto': 'החלק מהעבודה שהייתם רוצים לאתמט:',
    'roi.savings.label': 'חיסכון שנתי משוער',
    'roi.savings.desc': 'מבוסס על שעות העבודה שישתחררו',
    'roi.hours.label': 'שעות עבודה שנחסכות בשנה',
    'roi.hours.desc': 'זמן שהצוות שלכם יוכל להפנות למשימות בעלות ערך גבוה יותר',
    'roi.hours.unit': 'שעות',
    'roi.payback.label': 'זמן החזר משוער',
    'roi.payback.desc': 'לבנייה והטמעה של הפיילוט הראשון',
    'roi.payback.fast': 'פחות מ-4 שבועות',
    'roi.payback.mid': 'פחות מחודשיים',
    'roi.payback.slow': 'פחות מ-3 חודשים',

    'team.title': 'הצוות שמפעיל את PowOrg',
    'team.body': 'מאחורי הפלטפורמה עומד צוות של חברי AI, כל אחד מומחה בתחומו, פועל בשקיפות מלאה ובפיקוח אנושי. זו הדוגמה החיה לאוטומציה מבוקרת שאנחנו מביאים לארגון שלכם.',
    'team.poppy.name': 'פופי',
    'team.poppy.role': 'מנכ"לית',
    'team.poppy.bio': 'אסטרטגיה, כיוון והובלה.',
    'team.maya.name': 'מאיה',
    'team.maya.role': 'סמנכ"לית People & Operations',
    'team.maya.bio': 'תהליכים, אנשים ואיכות.',
    'team.mark.name': 'מארק',
    'team.mark.role': 'Marketing & Content Lead',
    'team.mark.bio': 'תוכן, מותג וקול.',
    'team.dave.name': 'דייב',
    'team.dave.role': 'CTO / ארכיטקט ראשי',
    'team.dave.bio': 'ארכיטקטורה, ביצועים ואבטחה.',
    'team.gadi.name': 'גדי',
    'team.gadi.role': 'מייסד',
    'team.gadi.bio': 'חזון, כיוון ותנופה.',

    'contact.title': 'בואו נדבר',
    'contact.subtitle': 'שיחה קצרה, ללא התחייבות. נבין את הצורך שלכם ונבדוק אם יש התאמה.',
    'agent.name': 'פופי (מנכ"לית AI)',
    'agent.role': 'סוכנת קליטה אוטונומית',
    'agent.input.placeholder': 'התחילו שיחה עם פופי...',

    'footer.copy': '&copy; 2026 PowOrg. כל הזכויות שמורות.',
    'footer.security': 'אבטחה',
    'footer.contact': 'דברו עם המנכ"לית',

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

// --- Structured content JS builds at runtime (use-case cards, intake chat) ---

export const content = {
  en: {
    useCases: [
      {
        icon: 'grid.svg', modalId: 'backoffice',
        title: 'Back-office automation',
        description: 'Keep your core systems (ERP, CRM) in sync and handle routine admin work automatically, with a person checking every important step.',
        challenge: 'Teams that process dozens of transactions a day lose thousands of hours a month to typing the same information into different systems, copying data between ERP and CRM, and sending status updates by hand. It’s slow, and it’s easy to make a costly mistake.',
        solutions: [
          'An AI assistant reads customer documents (contracts, orders, emails) automatically and securely',
          'It shows the right person a clear summary, who approves the entry to your CRM or ERP with one click',
          'It sends an automatic summary report to the manager in charge, with the full transaction details',
        ],
        metrics: [
          { value: 'Human-checked', label: 'before anything writes back' },
          { value: 'Private', label: 'runs on your own infrastructure' },
          { value: 'Agreed upfront', label: 'success is defined before we start' },
        ],
        security: 'Everything runs inside your organization’s own network. No data leaves your systems.',
      },
      {
        icon: 'document.svg', modalId: 'documents',
        title: 'Smart document processing',
        description: 'Pull structured data out of business documents (PDFs, scans, photos), with a simple approval step for a person before anything is saved to your CRM or ERP.',
        challenge: 'Finance and procurement teams handle hundreds of invoices, contracts, and forms every month. Manually typing data from PDFs and scans into your systems eats up valuable time, invites mistakes, and slows everything down.',
        solutions: [
          'Extracts structured data from PDFs, scans, and photos, with full Hebrew language support',
          'Recognizes the type of document (invoices, licenses, delivery notes, insurance forms) and pulls out the right fields',
          'Runs entirely on your own infrastructure, no sensitive files are uploaded to an outside cloud',
        ],
        metrics: [
          { value: 'Private', label: 'processed on your own infrastructure' },
          { value: 'Hebrew-ready', label: 'full Hebrew language support' },
          { value: 'Human-checked', label: 'a person reviews every result' },
        ],
        security: 'Fully local processing inside your network. No document is ever sent to an outside server.',
      },
      {
        icon: 'voice.svg', modalId: 'audio',
        title: 'Insights from calls and recordings',
        description: 'Automatic transcription and ready-to-use outputs (summaries, action items, task cards) straight from meetings and service calls.',
        challenge: 'Leadership meetings and service calls generate insights that get lost the moment the call ends. Manual transcription takes hours, summaries come out inconsistent, and follow-up tasks fall through the cracks.',
        solutions: [
          'Hebrew transcription with speaker identification, so you know who said what',
          'Turns the conversation into summaries, action items, and CRM updates, following a template you choose',
          'A consistent, reviewable format, so a person can check and approve it before it’s shared further',
        ],
        metrics: [
          { value: 'Hebrew-ready', label: 'built for Hebrew conversations' },
          { value: 'Cloud-based', label: 'powered by AWS transcription and AI' },
          { value: 'Private', label: 'stays inside your infrastructure' },
        ],
        security: 'Transcription and analysis happen locally only. Recordings never leave your organization’s network.',
      },
      {
        icon: 'shield.svg', modalId: 'internal-agents',
        title: 'Internal knowledge assistants',
        description: 'AI assistants with access to your internal knowledge base and procedures, so employees get fast, accurate answers and support during their work.',
        challenge: 'Employees waste real time searching for information across internal systems, procedure documents, and policies. Answers are scattered across dozens of places, which slows down important decisions.',
        solutions: [
          'An internal AI assistant with secure access to your knowledge base, procedures, and policy documents',
          'Accurate, source-backed answers that respect each employee’s existing permissions',
          'Search that returns well-reasoned answers with a link back to the original document',
        ],
        metrics: [
          { value: '-80%', label: 'less time spent searching for information' },
          { value: 'Always on', label: 'available around the clock' },
          { value: 'Permission-aware', label: 'people only see what they’re allowed to' },
        ],
        security: 'The assistant operates entirely within your internal network. No company information is exposed externally.',
      },
      {
        icon: 'users.svg', modalId: 'external-agents',
        title: 'Customer-facing assistants',
        description: 'Conversational assistants for your customers that can take real actions in your systems, book meetings, explain products, and open support tickets securely.',
        challenge: 'Busy support teams, long wait times, and frustrated customers. Every request needs a person to manually check several systems, take action, and log the result, which is slow and expensive.',
        solutions: [
          'A WhatsApp assistant (via Glassix) that runs in an isolated, access-controlled environment',
          'A built-in handoff that transfers the conversation smoothly to a person whenever it’s needed',
          'A general and per-assistant kill switch, so your organization is always in control',
        ],
        metrics: [
          { value: 'WhatsApp', label: 'via secure Glassix integration' },
          { value: 'Human handoff', label: 'a smooth transfer to a person when needed' },
          { value: 'Kill switch', label: 'you can shut it off instantly' },
        ],
        security: 'Customer details are protected inside your network. The assistant runs behind your organizational firewall.',
      },
    ],
    chat: {
      welcome: 'Hi! I’m Poppy, PowOrg’s AI CEO. I’m here to help figure out what an automation setup could look like for your organization.',
      askName: 'Let’s start with your name, please?',
      namePlaceholder: 'Type your full name...',
      greet: (name) => `Great to meet you, ${name}! Which organization or company are you with?`,
      orgPlaceholder: 'Your company or organization...',
      askEmail: 'And what’s the best business email to reach you at?',
      emailPlaceholder: 'Your email address...',
      emailInvalid: 'That doesn’t look like a valid email. Could you enter a working business email?',
      askProcess: 'Which business process is the most important one for you to automate and keep under control right now?',
      quickOptions: [
        'Document & invoice processing (D2A)',
        'Transcribing and analyzing calls or meetings',
        'Syncing back-office processes (ERP/CRM)',
        'Internal knowledge & support assistants',
        'Something else (I’ll type it)',
      ],
      quickOptionsPlaceholder: 'Pick an option or just type here...',
      askFreeText: 'Tell us a bit about your process, in your own words, whatever helps us understand it better.',
      freeTextPlaceholder: 'Tell us a bit about your process...',
      processing: (name) => `Thanks, ${name}. I’m putting this together and checking the best fit for you...`,
      matchFound: 'This looks like a strong fit. I’m sending your details straight to Gadi, our human founder.',
      followUp: 'Someone from the team will follow up with a focused suggestion within one business day.',
      successToastTitle: 'Thanks, that came through!',
      successToastBody: 'Someone from the team will follow up within one business day.',
      submitError: 'There was a small hiccup sending this to our server. No worries, your message is saved, you can also reach us directly at gadi@poworg.com.',
      subjectPrefix: 'New inquiry from PowOrg website',
    },
  },

  he: {
    useCases: [
      {
        icon: 'grid.svg', modalId: 'backoffice',
        title: 'אוטומציית בק-אופיס',
        description: 'שומרת על סנכרון בין מערכות הליבה (ERP, CRM) ומטפלת במשימות אדמיניסטרטיביות שגרתיות באופן אוטומטי, עם אישור אנושי בכל שלב קריטי.',
        challenge: 'צוותים שמעבדים עשרות עסקאות ביום מבזבזים אלפי שעות בחודש על הקלדת אותו מידע במערכות שונות, העתקת נתונים בין ERP ל-CRM, ושליחת עדכוני סטטוס ידנית. זה איטי, וקל לטעות בו טעות יקרה.',
        solutions: [
          'סוכן AI קורא מסמכי לקוח (הסכמים, הזמנות, אימיילים) באופן אוטומטי ומאובטח',
          'מציג לאדם הרלוונטי תמונת מצב ברורה, שמאשר את הרישום ל-CRM או ל-ERP בלחיצה אחת',
          'שולח דוח מסכם אוטומטי למנהל האחראי עם כל פרטי העסקה',
        ],
        metrics: [
          { value: 'בבדיקת אדם', label: 'לפני כל כתיבה חזרה למערכת' },
          { value: 'פרטי', label: 'פועל על התשתית שלכם' },
          { value: 'מוסכם מראש', label: 'ההצלחה מוגדרת לפני שמתחילים' },
        ],
        security: 'הכל פועל בתוך הרשת של הארגון שלכם. שום מידע לא יוצא מהמערכות שלכם.',
      },
      {
        icon: 'document.svg', modalId: 'documents',
        title: 'עיבוד מסמכים חכם',
        description: 'חילוץ נתונים מובנים ממסמכים עסקיים (PDF, סריקות, תמונות), עם שלב אישור פשוט לאדם לפני שמשהו נשמר ל-CRM או ל-ERP.',
        challenge: 'צוותי כספים ורכש מטפלים במאות חשבוניות, חוזים וטפסים בכל חודש. הקלדה ידנית של נתונים מ-PDF וסריקות למערכות שלכם גוזלת זמן יקר, מזמינה טעויות ומאטה הכל.',
        solutions: [
          'חילוץ נתונים מובנים מ-PDF, סריקות ותמונות, עם תמיכה מלאה בעברית',
          'זיהוי סוג המסמך (חשבוניות, רישיונות, תעודות משלוח, טפסי ביטוח) וחילוץ השדות הרלוונטיים',
          'רץ במלואו על התשתית שלכם, בלי להעלות קבצים רגישים לענן חיצוני',
        ],
        metrics: [
          { value: 'פרטי', label: 'מעובד על התשתית שלכם' },
          { value: 'עברית מלאה', label: 'תמיכה מלאה בשפה העברית' },
          { value: 'בבדיקת אדם', label: 'אדם בודק כל תוצאה' },
        ],
        security: 'עיבוד מקומי מלא בתוך הרשת שלכם. שום מסמך לא נשלח לשרת חיצוני.',
      },
      {
        icon: 'voice.svg', modalId: 'audio',
        title: 'תובנות משיחות והקלטות',
        description: 'תמלול אוטומטי ותוצרים מוכנים לשימוש (סיכומים, משימות לביצוע, כרטיסי משימה) ישירות מפגישות ושיחות שירות.',
        challenge: 'ישיבות הנהלה ושיחות שירות מייצרות תובנות שנעלמות ברגע שהשיחה מסתיימת. תמלול ידני גוזל שעות, הסיכומים לא עקביים, ומשימות המשך נופלות בין הכיסאות.',
        solutions: [
          'תמלול בעברית עם זיהוי דוברים, כך שתדעו מי אמר מה',
          'הופך את השיחה לסיכומים, משימות לביצוע ועדכוני CRM, לפי תבנית שתבחרו',
          'פורמט עקבי וניתן לבדיקה, כך שאדם יכול לבדוק ולאשר לפני שהוא מופץ הלאה',
        ],
        metrics: [
          { value: 'עברית מלאה', label: 'בנוי לשיחות בעברית' },
          { value: 'מבוסס ענן', label: 'מופעל על תמלול ו-AI של AWS' },
          { value: 'פרטי', label: 'נשאר בתוך התשתית שלכם' },
        ],
        security: 'תמלול וניתוח מקומיים בלבד. ההקלטות לעולם לא עוזבות את הרשת של הארגון שלכם.',
      },
      {
        icon: 'shield.svg', modalId: 'internal-agents',
        title: 'סוכני ידע פנימיים',
        description: 'סוכני AI עם גישה למאגרי הידע והנהלים הפנימיים שלכם, כך שעובדים מקבלים תשובות מהירות ומדויקות ותמיכה בעבודה השוטפת.',
        challenge: 'עובדים מבזבזים זמן אמיתי בחיפוש מידע במערכות פנימיות, מסמכי נהלים ומדיניות. התשובות מפוזרות בעשרות מקומות, וזה מאט החלטות חשובות.',
        solutions: [
          'סוכן AI פנימי עם גישה מאובטחת למאגרי הידע, הנהלים ומסמכי המדיניות שלכם',
          'תשובות מדויקות ומבוססות מקורות, שמכבדות את ההרשאות הקיימות של כל עובד',
          'חיפוש שמחזיר תשובות מנומקות עם קישור למסמך המקורי',
        ],
        metrics: [
          { value: '80%-', label: 'פחות זמן בחיפוש מידע' },
          { value: 'זמין תמיד', label: 'זמינות מסביב לשעון' },
          { value: 'לפי הרשאות', label: 'כל אחד רואה רק את מה שמותר לו' },
        ],
        security: 'הסוכן פועל כולו בתוך הרשת הפנימית שלכם. שום מידע ארגוני לא נחשף החוצה.',
      },
      {
        icon: 'users.svg', modalId: 'external-agents',
        title: 'סוכנים ללקוחות',
        description: 'סוכני שיחה ללקוחות שלכם שיכולים לבצע פעולות אמיתיות במערכות שלכם, לתאם פגישות, להסביר מוצרים ולפתוח קריאות שירות בצורה מאובטחת.',
        challenge: 'צוותי שירות עמוסים, זמני המתנה ארוכים ולקוחות מתוסכלים. כל פנייה דורשת מאדם לבדוק ידנית כמה מערכות, לבצע פעולה ולתעד אותה, תהליך איטי ויקר.',
        solutions: [
          'סוכן שיחה בוואטסאפ (דרך Glassix) שפועל בסביבה מבודדת ומבוקרת הרשאות',
          'מנגנון העברה מובנה שמעביר את השיחה בצורה חלקה לאדם בכל פעם שצריך',
          'מתג עצירה כללי ופר-סוכן, כך שהארגון שלכם תמיד בשליטה',
        ],
        metrics: [
          { value: 'וואטסאפ', label: 'דרך אינטגרציית Glassix מאובטחת' },
          { value: 'העברה לאדם', label: 'מעבר חלק לנציג אנושי כשצריך' },
          { value: 'מתג עצירה', label: 'אפשר לכבות מיידית' },
        ],
        security: 'פרטי הלקוח מוגנים בתוך הרשת שלכם. הסוכן פועל מאחורי חומת האש הארגונית.',
      },
    ],
    chat: {
      welcome: 'שלום! אני פופי, מנכ"לית ה-AI של PowOrg. אני כאן כדי לעזור לחשוב איך תהליך אוטומציה יכול להיראות בארגון שלכם.',
      askName: 'נתחיל בשמכם, בבקשה?',
      namePlaceholder: 'הקלידו שם מלא...',
      greet: (name) => `נעים להכיר, ${name}! מאיזו חברה או ארגון אתם?`,
      orgPlaceholder: 'שם החברה או הארגון...',
      askEmail: 'ומה כתובת האימייל העסקי הכי טובה ליצירת קשר?',
      emailPlaceholder: 'כתובת אימייל...',
      emailInvalid: 'זה לא נראה כמו אימייל תקין. אפשר להזין כתובת אימייל עסקית תקינה?',
      askProcess: 'איזה תהליך עסקי הכי חשוב לכם לאתמט ולשמור עליו בשליטה כרגע?',
      quickOptions: [
        'עיבוד מסמכים וחשבוניות (D2A)',
        'תמלול וניתוח שיחות או פגישות',
        'סנכרון תהליכי בק-אופיס (ERP/CRM)',
        'סוכני ידע ותמיכה פנימית',
        'משהו אחר (אקליד בעצמי)',
      ],
      quickOptionsPlaceholder: 'בחרו אפשרות או הקלידו כאן...',
      askFreeText: 'ספרו לנו קצת על התהליך שלכם, במילים שלכם, כל מה שיעזור לנו להבין אותו טוב יותר.',
      freeTextPlaceholder: 'ספרו לנו קצת על התהליך שלכם...',
      processing: (name) => `תודה, ${name}. אני מרכיבה את התמונה ובודקת מה הכי מתאים לכם...`,
      matchFound: 'זו נראית התאמה טובה. אני שולחת את הפרטים שלכם ישירות לגדי, המייסד האנושי שלנו.',
      followUp: 'מישהו מהצוות יחזור אליכם עם הצעה ממוקדת תוך יום עסקים אחד.',
      successToastTitle: 'תודה, זה התקבל!',
      successToastBody: 'מישהו מהצוות יחזור אליכם תוך יום עסקים אחד.',
      submitError: 'הייתה תקלה קטנה בשליחה לשרת. אל דאגה, ההודעה שלכם נשמרה, אפשר גם לפנות אלינו ישירות בכתובת gadi@poworg.com.',
      subjectPrefix: 'פנייה חדשה מאתר PowOrg',
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
 *  every JS-rendered piece (chat, use-case cards, ROI labels) consistently in one language. */
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
