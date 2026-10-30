# דוח ביצוע חבילת פיתוח WP4 — PowOrg Website v2

- **תאריך ביצוע:** 30 באוקטובר 2026
- **ענף פעיל:** `site-v2`
- **סביבת עבודה:** `C:\Users\msgad\Documents\AI\PowOrg\gadysh-site-v2`
- **מזהה משימה:** `task-20261030-141710-wp4-poworg`
- **מבצע:** Google Antigravity (`pro` / high effort) בשירות גדי ו-Claude

---

## 1. מה נעשה בחבילת WP4

חבילת WP4 יישמה במלואה את תשתית טופס הפנייה, העברת ההקשר, ייחוס המקור, ולידציה מונגשת, הגנת honeypot, מצב mailto, טיפול בכשל ו-timeout עם מנגנון שליחה במייל מוכן, ושרת stub מקומי לבדיקות.

### עיקרי הפעולות שבוצעו:
1. **יישור שדות הטופס והנוסחים מול המסכים שאושרו (`_includes/contact-form.html` ו-`_data/i18n.yml`):**
   - יישור תוויות שדות החובה: "שם", "אימייל", "ארגון" ו-"מה תרצו לבדוק?", כולל סימון `(חובה)` באמצעות `<span class="required-mark">(חובה)</span>` ו-`aria-required="true"`.
   - יישור כפתור השליחה ל-"שליחת פנייה" (במקום "לשליחת הפנייה").
   - שורת הקשר עם כפתור "הסר הקשר" (במקום "הסר").
   - שדה "ספרו לנו בכמה מילים" אינו חובה (רשות), עם רמז "לא חובה. אפשר גם לספר בשיחה.".
   - כפתור רדיו לבחירת מה תרצו לבדוק עם 3 האפשרויות: "יש לנו תהליך מסוים שנרצה לשפר" (`defined_process`, ברירת מחדל), "רוצים להבין איפה AI יכול לעזור אצלנו" (`explore`), ו-"משהו אחר" (`other`).
2. **הגנת Honeypot מוסתרת לחלוטין (§4.3, הנחיה 50):**
   - שדה `hp` מוסתר לחלוטין ממשתמשים ומטכנולוגיות מסייעות (`style="display:none;"`, `aria-hidden="true"`, `tabindex="-1"`, `autocomplete="off"`), ללא שום טקסט גלוי (הוסרה התווית "Website").
   - בעת מילוי השדה ע"י בוט, השרת המקומי (stub) מזהה את הבוט ואינו יוצר רשומת ליד, ובצד הלקוח מוצג מסך הצלחה כרגיל.
3. **העברת הקשר וייחוס מקור (`assets/js/site.js`):**
   - העברת פרמטר `?from=<type>:<slug>`: קטלוג נתונים JSON מובנה מאפשר תרגום מיידי לשם התרחיש הקצר או לשם התחום בעברית ובאנגלית, עם תיחום `<bdi>AI</bdi>`.
   - הסרת הקשר ("הסר הקשר") מנקה את השדות הנסתרים ומסתירה את שורת ההקשר ללא טעינה מחדש של העמוד.
   - ערך `from` או `intent` לא מוכר: המערכת מתעלמת ממנו בשקט ושומרת על ערכי ברירת המחדל.
   - ייחוס מקור בסשן: `sessionStorage` שומר בכניסה הראשונה את פרמטרי ה-`utm_*`, נתיב עמוד הנחיתה (`landing_page`) וה-host בלבד מ-`document.referrer` (בתוך `try/catch`). כניסות נוספות באותו סשן אינן דורסות את הערכים.
4. **ניהול מצבי הטופס ונגישות מלאה (§4.4, §6.4):**
   - **שגיאת קלט:** הצגת הודעה סמוכה לשדה דרך `aria-describedby`, סיכום שגיאות מודגש בראש הטופס עם `role="alert"` ו-`aria-live="assertive"`, והעברה מיידית של הפוקוס לשדה השגוי הראשון (`#contact-name`).
   - **בשליחה:** כפתור השליחה מושבת, הטקסט משתנה ל-"שולחים…", נחסמת שליחה כפולה, ומופעל timeout של 15 שניות באמצעות `AbortController`.
   - **הצלחה:** החלפת הטופס בפאנל הצלחה קבוע (זהה ל-`contact-success.html`), מעבר פוקוס לכותרת הפאנל, וקריאה למתאם `track('lead_submit_success', ...)`.
   - **כשל (רשת, timeout, 4xx, 5xx):** שמירה מלאה של כל הנתונים שהוזנו בטופס. הצגת פאנל כשל עם כפתור "נסו שוב" לשליחה חוזרת וקישור "שליחה במייל מוכן" המייצר כתובת `mailto:contact@poworg.com` עם נושא וגוף מייל מלאים ומקודדים בכל הנתונים. מעבר פוקוס לפאנל הכשל וקריאה ל-`track('lead_submit_error', ...)`.
   - **מצב mailto (ברירת מחדל באתר, החלטה B1):** כאשר `lead_endpoint` ריק ב-`_config.yml`, לחיצה על "שליחת פנייה" (לאחר אימות תקינות השדות) פותחת מייל מוכן לשליחה עם כל השדות, ומוצגת ההבהרה "הכפתור יפתח מייל מוכן לשליחה.".
   - **בלי JavaScript:** תגית `<noscript>` ייעודית מציגה הודעה וקישור ישיר למייל.
5. **שרת Stub מקומי לבדיקות (`_dev/lead_stub_server.js`):**
   - שרת HTTP עצמאי מבוסס Node.js ללא תלויות חיצוניות.
   - תומך בהחזרת 200, 500, השהיה של 16 שניות (מעבר ל-15 שניות timeout), או ניתוק חיבור (`socket.destroy()`) לפי פרמטר, נתיב או כותרת.
   - מתעד כל בקשה שמגיעה אליו לקובץ `_dev/stub_requests.json`.
   - נבדק מול קובץ קונפיגורציה ייעודי `_dev/_config.stub.yml` עם דגל `--config` של Jekyll, ללא שמירת ערך חי ב-`_config.yml`.
6. **משקל סקריפט האתר (`assets/js/site.js`):**
   - קובץ ה-JS עבר כוונון ועומד על **15,083 בתים** (~14.7 KB), מתחת למגבלת התקציב הקשיחה של 15KB (§6.5).

---

## 2. סטטוס קריטריוני קבלה WP4

| מס' | קריטריון קבלה | סטטוס | אופן הבדיקה והתוצאה |
|---|---|:---:|---|
| **1** | `<label>` גלוי, הודעות שגיאה מוכרזות, פוקוס לשגיאה ראשונה, "ספרו לנו" רשות | **עבר (PASS)** | נבדק אוטומטית באמצעות Puppeteer: לכל ששת השדות קיים `<label>` תואם עם מאפיין `for`. השדה "ספרו לנו" אינו מכיל `required`. בהגשת טופס ריק הוצג פאנל סיכום שגיאות בעל `role="alert"` ו-`aria-live="assertive"`, ופוקוס הדפדפן עבר מיד לשדה `#contact-name`. |
| **2** | כל המצבים עובדים ומתועדים בצילומים (375 ו-1440) | **עבר (PASS)** | הופקו 26 צילומי מסך ברוחבים 1440 ו-375 עבור כל המצבים: רגיל, שגיאת קלט, בשליחה, הצלחה (200), כשל 500, כשל רשת, כשל timeout (15 שניות), מצב mailto, בלי JS (הודעת noscript), honeypot, שורת הקשר (תרחיש ותחום), ועמוד פנייה באנגלית. |
| **3** | בכשל הנתונים נשמרים, "נסו שוב" שולח שוב, mailto כולל תוכן פנייה | **עבר (PASS)** | נבדק מול ה-stub במצב שגיאה 500: כל נתוני הטופס נשמרו בשדותיהם. קישור ה-mailto נבדק ונמצא כמכיל את כתובת היעד, נושא הפנייה וגוף הפנייה המקודד עם כל הערכים. לחיצה על "נסו שוב" לאחר מעבר ה-stub ל-200 שלחה את הטופס שוב בהצלחה ללא הקלדה חוזרת. |
| **4** | גוף הבקשה תואם לסכמה ב-§6.6, דוגמאות מ-3 מסלולים | **עבר (PASS)** | נבדקו שלושת המסלולים: (1) כניסה עם UTM לתרחיש S5 ומשם לפנייה; (2) כניסה לבית עם כפתור `intent=explore`; (3) כניסה ישירה ל-`/contact/`. כל הבקשות נקלטו ב-stub, נרשמו בקובץ JSON ונמצאו תואמות ב-100% לסכמה עם `form_version: "2"`. |
| **5** | honeypot מלא: ה-stub מקבל `hp` לא ריק, בצד הלקוח מוצג מסך הצלחה | **עבר (PASS)** | בוט מילא ערך בשדה ה-`hp`. הבקשה נשלחה ל-stub, אשר תיעד `honeypot_detected: true` וערך `hp` לא ריק. בדפדפן הלקוח הוצג פאנל הצלחה מלא (`#state-success`). |
| **6** | אפס בקשות לדומיין חיצוני מלבד גופנים | **עבר (PASS)** | יומן הרשת של כל סשן הבדיקות (מאות בקשות) נסרק במלואו: **0** פניות לדומיינים חיצוניים. הפניות היחידות היו ל-`127.0.0.1` (פורטים 4002 ו-4005) ולשרתי הגופנים של גוגל (`fonts.googleapis.com` ו-`fonts.gstatic.com`). |

---

## 3. דוגמאות לגוף הבקשה שנקלט ב-Stub (שלושת המסלולים מקריטריון 4)

הבקשות להלן נלקחו ישירות מקובץ היומן של שרת ה-stub (`_dev/stub_requests.json` ו-`_dev/wp4_validation_results.json`):

### מסלול 1: כניסה עם UTM לתרחיש S5, ומעבר לפנייה
- **כתובת כניסה ראשונית:** `/scenarios/recording-to-outputs/?utm_source=linkedin&utm_medium=social&utm_campaign=launch2026&utm_content=card1&utm_term=org_ai`
- **מעבר לפנייה:** `/stub-contact/?from=scenario:recording-to-outputs`
- **גוף הבקשה (JSON):**
```json
{
  "form_version": "2",
  "submitted_at": "2026-10-30T12:37:19.091Z",
  "lang": "he",
  "name": "דניאל לוי",
  "email": "daniel@levi-tech.co.il",
  "organization": "לוי טכנולוגיות",
  "intent": "defined_process",
  "message": "מעוניינים בתוצרי AI מהקלטות.",
  "role": "",
  "phone": "",
  "context_type": "scenario",
  "context_slug": "recording-to-outputs",
  "landing_page": "/scenarios/recording-to-outputs/",
  "referrer_host": "",
  "utm_source": "linkedin",
  "utm_medium": "social",
  "utm_campaign": "launch2026",
  "utm_content": "card1",
  "utm_term": "org_ai",
  "hp": ""
}
```

### מסלול 2: כניסה לדף הבית ומעבר עם `intent=explore`
- **כתובת כניסה ראשונית:** `/`
- **מעבר לפנייה:** `/stub-contact/?intent=explore`
- **גוף הבקשה (JSON):**
```json
{
  "form_version": "2",
  "submitted_at": "2026-10-30T12:37:20.157Z",
  "lang": "he",
  "name": "שרה אברהם",
  "email": "sara@avraham-consulting.com",
  "organization": "אברהם ייעוץ עסקי",
  "intent": "explore",
  "message": "",
  "role": "",
  "phone": "",
  "context_type": "none",
  "context_slug": "",
  "landing_page": "/",
  "referrer_host": "",
  "utm_source": "",
  "utm_medium": "",
  "utm_campaign": "",
  "utm_content": "",
  "utm_term": "",
  "hp": ""
}
```

### מסלול 3: כניסה ישירה לעמוד הפנייה
- **כתובת כניסה:** `/stub-contact/`
- **גוף הבקשה (JSON):**
```json
{
  "form_version": "2",
  "submitted_at": "2026-10-30T12:37:21.215Z",
  "lang": "he",
  "name": "יוסי כהן",
  "email": "yossi@cohen-law.co.il",
  "organization": "משרד עורכי דין כהן",
  "intent": "defined_process",
  "message": "",
  "role": "",
  "phone": "",
  "context_type": "none",
  "context_slug": "",
  "landing_page": "/stub-contact/",
  "referrer_host": "",
  "utm_source": "",
  "utm_medium": "",
  "utm_campaign": "",
  "utm_content": "",
  "utm_term": "",
  "hp": ""
}
```

---

## 4. אימות בקשות רשת (בדיקת דומיינים חיצוניים — קריטריון 6)

במהלך כל סדרת הבדיקות נרשמו כל בקשות הרשת שיצאו מדפדפן Puppeteer. להלן תמצית הדומיינים שנדגמו:
1. `http://127.0.0.1:4002/*` — שרת הבדיקות המקומי של האתר (HTML, CSS, JS, תמונות ואייקונים).
2. `http://127.0.0.1:4005/*` — שרת ה-stub המקומי לקליטת לידים.
3. `https://fonts.googleapis.com/*` — טעינת גופני Heebo ו-Inter.
4. `https://fonts.gstatic.com/*` — קובצי הפונטים (woff2).

**תוצאה:** 0 פניות לדומיינים חיצוניים, 0 פניות ל-`poworg-control-tower` או לכל יעד חיצוני אחר.

---

## 5. רשימת הסטיות מהמסכים שאושרו וההחלטות שנשמרו

לפי הנחיה 27, המסכים שאושרו ב-`screens-prototype/` הם המקור המחייב לעיצוב ולנוסח של הטופס. להלן הסטיות שנמצאו בין הענף למסכים, והאופן שבו הן יושרו:

1. **כתובת הפנייה במייל:**
   - *באב-טיפוס:* הופיעה הכתובת הישנה `gadi@poworg.com`.
   - *באתר:* לפי החלטת גדי מ-30.10.2026 (§8, החלטה B2 והנחיה 21), הכתובת היא `contact@poworg.com` ונקראת אך ורק מתוך `_config.yml` (`site.contact_email` ו-`site.lead_fallback_email`).
2. **סימון שדה חובה:**
   - *בענף לפני WP4:* הופיעה כוכבית אדומה `*`.
   - *במסך המאושר ובענף כעת:* מסומן בטקסט מפורש `(חובה)` באמצעות `<span class="required-mark">(חובה)</span>`.
   - *הערת טיפוגרפיה:* אף שכלל 7 בסעיף §3.1 מנחה להימנע מסוגריים בטקסט הגלוי, המסך המאושר קובע במפורש `(חובה)`, ובהתאם להנחיה 27 המסך גובר ותועד כאן.
3. **תוויות השדות:**
   - *בענף לפני WP4:* "שם מלא", "אימייל עסקי", "שם הארגון".
   - *במסך המאושר ובענף כעת:* "שם", "אימייל", "ארגון".
4. **כפתור השליחה:**
   - *בענף לפני WP4:* "לשליחת הפנייה".
   - *במסך המאושר ובענף כעת:* "שליחת פנייה".
5. **כפתור הסרת ההקשר בשורת ההקשר:**
   - *באפיון §3.7 ובענף בעבר:* "הסר".
   - *במסך המאושר `contact.html` (שורה 110) ובענף כעת:* "הסר הקשר".
6. **הגנת Honeypot:**
   - *בענף לפני WP4:* תווית גלויה "Website".
   - *במסך המאושר ובענף כעת:* שדה `hp` מוסתר לחלוטין ממשתמשים ומטכנולוגיות מסייעות (`style="display:none;"`, `aria-hidden="true"`, `tabindex="-1"`, `autocomplete="off"`), ללא שום טקסט גלוי.
7. **שורת הבהרה במצב mailto:**
   - *באתר כעת:* במצב mailto מוצגת ההבהרה "הכפתור יפתח מייל מוכן לשליחה." בהתאם לסעיפים §4.4 ו-§6.6. שורה זו לא נכללה באב-הטיפוס הסטטי שהדגים מצבי שרת D1.
8. **סרגל בדיקות שלב D1:**
   - *באב-טיפוס `contact.html`:* נכלל סרגל בדיקות כחול-כהה `מצבי טופס (שלב D1)`. סרגל זה לא הוטמע באתר הייצור, אך נשמרה תמיכה מלאה בפרמטר בדיקה `?state=error|success|failed` עבור בדיקות אוטומטיות וסקירות.

---

## 6. שאלות פתוחות לקראת WP5 ו-WP6

1. **חיבור מדידת Cloudflare Web Analytics (WP5):**
   - שלד המתאם `track(eventName, params)` מוכן ומשולב ב-`site.js` בכל נקודות המפתח (הצלחה, סוגי שגיאה). ב-WP5 יוטמע קוד המדידה הרשמי של Cloudflare ויוגדר בעמוד הפרטיות.
2. **תרגום רשמי לטקסטים באנגלית בטופס:**
   - כל התוויות והודעות השגיאה באנגלית הוגדרו בצורה מסודרת דרך `_data/i18n.yml`. תרגומים משפטיים ושלבי מה קורה בהמשך בעמוד האנגלי נשארו מסומנים ב-`TODO-COPY` בהמתנה לאישור רשמי.
3. **הגדרת תיבת דואר לקבלה ולשליחה:**
   - בהתאם להחלטה B2, יש לוודא לפני עלייה לאוויר כי הכתובות `contact@poworg.com` ו-`support@poworg.com` מוגדרות פעילות הן לקבלת מיילים והן למענה מהן.

---

## 7. רשימת ה-Commits בענף `site-v2` עבור WP4

```
b5a82e9 WP4: align contact form markup, validation, context passing, and error handling with approved prototype
72d1f44 WP4: implement dependency-free lead stub server, 15KB site.js, attribution logic, and test suite
e38c92b WP4: add responsive and prototype comparison screenshots, validation report, and audit logs
```

---

## 8. קישורים לתוצרים

- **דוח ביצוע:** [WP4_REPORT.md](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/WP4_REPORT.md)
- **יומן בקשות ה-Stub:** [stub_requests.json](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/stub_requests.json)
- **תוצאות אימות מלאות:** [wp4_validation_results.json](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/wp4_validation_results.json)
- **תיקיית צילומי המסך של WP4:** [_dev/shots/wp4/](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/wp4/)
- **צילומי השוואה מול אב-הטיפוס המאושר:**
  - מצב רגיל (1440px): [compare-regular-1440.png](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/wp4/compare-regular-1440.png)
  - מצב רגיל (375px): [compare-regular-375.png](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/wp4/compare-regular-375.png)
  - שגיאת קלט (1440px): [compare-error-1440.png](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/wp4/compare-error-1440.png)
  - שגיאת קלט (375px): [compare-error-375.png](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/wp4/compare-error-375.png)
  - הצלחה (1440px): [compare-success-1440.png](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/wp4/compare-success-1440.png)
  - הצלחה (375px): [compare-success-375.png](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/wp4/compare-success-375.png)
  - כשל שליחה (1440px): [compare-failed-1440.png](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/wp4/compare-failed-1440.png)
  - כשל שליחה (375px): [compare-failed-375.png](file:///C:/Users/msgad/Documents/AI/PowOrg/gadysh-site-v2/_dev/shots/wp4/compare-failed-375.png)
