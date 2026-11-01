# דוח ביצוע חבילת פיתוח WP5 — PowOrg Website v2: מדידה (Measurement)

- **תאריך ביצוע:** 30 באוקטובר 2026
- **ענף פעיל:** `site-v2`
- **סביבת עבודה:** `C:\Users\msgad\Documents\AI\PowOrg\gadysh-site-v2`
- **מזהה משימה:** `task-20261030-163106-wp5-poworg`
- **מבצע:** Google Antigravity (`pro` / high effort) בשירות גדי ו-Claude

---

## 1. מה נעשה בחבילת WP5

חבילת WP5 יישמה במלואה את תשתית המדידה והאנליטיקה לאתר PowOrg לפי סעיפים §6.7, §6.6, §7.2 WP5, והחלטות B1, B2 ו-B4 באפיון (`claude_website_spec_v2.md`).

### עיקרי הפעולות שבוצעו:

1. **תשתית Cloudflare Web Analytics (`_config.yml` ו-`_includes/analytics.html`):**
   - הוגדר שדה `cloudflare_analytics_token: ""` ב-`_config.yml` עם ערך ברירת מחדל ריק.
   - שוכתב `_includes/analytics.html`: כאשר הטוקן ריק – **לא מיוצרת שום תגית סקריפט ולא יוצאת שום בקשת רשת**.
   - כאשר הטוקן מוגדר ולא ריק: נטענת תגית הסקריפט הרשמית מ-`https://static.cloudflareinsights.com/beacon.min.js` עם מאפיין `defer` ומאפיין `data-cf-beacon='{"token": "..."}'`.
   - הסקריפט מוחרג אוטומטית ואינו נטען בעמוד `styleguide` או בעמודים עם `noindex: true` (כגון `404.html`) או `sitemap: false`.

2. **מתאם המדידה והאירועים `track(name, params)` ב-`assets/js/site.js`:**
   - **חתימה אחידה:** כל אירוע מקבל אוטומטית `page` (הנתיב ללא query string) ו-`lang` (מזהה השפה, `he` או `en`).
   - **מצב Debug:** כאשר הכתובת כוללת `?debug=track` או כאשר ב-`localStorage` מוגדר `poworg_debug=track` (בתוך מעטפת `try/catch`), נכתבת שורת לוג יחידה לקונסול בפורמט:
     `[track] <event_name> <json_params>`
   - **רשימה לבנה קשיחה לסינון פרטים אישיים (Zero PII):**
     המתאם מאפשר אך ורק מפתחות מורשים: `['location', 'target', 'intent', 'slug', 'from', 'error_type']` (בנוסף ל-`page` ו-`lang`). כל מפתח אחר (כגון שדות טופס, שמות, אימיילים, טלפונים, תוכן הודעות, או פרמטרי UTM) נזרק אוטומטית.
   - **נקודת חיבור יחידה לעתיד:** הפונקציה `dispatch(name, clean)` מהווה נקודת חיבור מרוכזת אחת לשליחה לכלי אנליטיקה עתידי, כרגע כ-no-op מנומק בהערה.

3. **סימון רכיבים ותבניות במאפייני מעקב (Data Attributes):**
   - `_includes/header.html`: הוספת `data-track-location="header"` לכפתור הפנייה בדסקטופ (`#desktop-cta`), במובייל (`.btn-compact`), ובתוך המגירה (`.drawer-footer .btn`). (הערת תיעוד: קישורי השפה במגירה אינם נושאים מחלקת `.lang-switch` כדי לשמר את העיצוב המאושר, ומזוהים באמצעות `a[hreflang]`).
   - `_includes/cta-band.html`: הוספת `data-track-location="cta-band"`.
   - `index.html` ו-`en/index.html`: הוספת `data-track-location="hero"` לכפתור הפנייה הראשי ב-Hero.
   - `_includes/entry-card.html`: הוספת `data-track-intent="{{ include.intent }}"` לכרטיסי הפתיחה.
   - `_layouts/scenario.html`: הוספת `data-scenario-slug="{{ page.scenario }}"` לסקציית ה-Hero, ו-`data-track-location="scenario-hero"` לכפתור הפנייה.
   - `_layouts/domain.html`: הוספת `data-domain-slug="{{ page.domain }}"` לסקציית ה-Hero.

4. **חיבור כל 11 האירועים מ-§6.7:**
   - `cta_click` (לחיצה על כפתורי פנייה ראשיים: `hero`, `header`, `cta-band`, `scenario-hero`)
   - `entry_choice` (לחיצה על דרכי פתיחה: `defined_process`, `explore`)
   - `scenario_view` (טעינת עמוד תרחיש עם `slug`)
   - `domain_view` (טעינת עמוד תחום עם `slug`)
   - `contact_view` (טעינת עמוד פנייה עם `from`)
   - `form_start` (אינטראקציה ראשונה עם שדה בטופס, פעם אחת לכל טעינת עמוד)
   - `form_submit` (שליחת טופס תקין לאחר אימות צד לקוח)
   - `lead_submit_success` (הצלחת קליטת ליד, אך ורק לאחר 2xx עם `ok !== false`)
   - `lead_submit_error` (כשל בשליחה עם `error_type`: `http_500`, `network`, `timeout`, `rejected`)
   - `email_fallback_click` (לחיצה על קישור מייל חלופי בפאנל הכשל או קישור מייל ישיר)
   - `lang_switch` (לחיצה על כפתור החלפת שפה)

5. **תקציב קוד וגודל קובץ (`assets/js/site.js`):**
   - גודל הקובץ הסופי: **15,331 בתים**, מתחת לתקרת ה-15KB הקשיחה (15,360 בתים) לפי §6.5.

6. **חבילת בדיקות אימות אוטומטית מקצה לקצה (`_dev/run_wp5_validation.js`):**
   - הרצת סוויטת בדיקות מלאה באמצעות Puppeteer כנגד שרת מקומי ושרת stub (`_dev/lead_stub_server.js`).
   - בדיקת כל 11 האירועים, בדיקת חסינות PII מלאה, בדיקת רשת עם טוקן ריק (0 בקשות אנליטיקה), ובדיקת יצירת תגית ויירוט בקשה עם טוקן מזויף.

---

## 2. סטטוס קריטריוני קבלה WP5

| מס' | קריטריון קבלה מוגדר | סטטוס | אופן הבדיקה והתוצאה |
|---|---|:---:|---|
| 1 | **כל אירוע מ-§6.7 נשלח פעם אחת לכל פעולה עם הפרמטרים הנכונים** | **עבר** (PASS) | נבדק אוטומטית באמצעות יומן קונסול ב-Puppeteer במצב `?debug=track`. כל 11 האירועים נלכדו בהצלחה עם שדות `page`, `lang` והפרמטרים המוגדרים. `form_start` אומת שנשלח פעם אחת בלבד באינטראקציה ראשונה ולא נשלח שוב בהקלדה או במעבר שדות נוספים. |
| 2 | **אין פרטים אישיים (PII) בשום אירוע** | **עבר** (PASS) | נסרקו כל אובייקטי הפרמטרים של כל האירועים שנלכדו בכל התרחישים. אושר שאף מפתח אינו חורג מהרשימה הלבנה, ושום ערך קלט מהטופס (שם "ישראל ישראלי", אימייל, ארגון, טלפון, תוכן הודעה) או ערכי UTM לא מופיעים בשום אירוע. |
| 3 | **`lead_submit_success` נשלח רק אחרי 2xx** | **עבר** (PASS) | נבדק מול שרת ה-stub: כאשר הוחזר 200 עם `ok: true`, האירוע נשלח. כאשר נבדקו תרחישי כשל (500, ניתוק רשת, תשובת rejected עם `ok: false`), האירוע `lead_submit_success` **לא נשלח כלל** (0 קריאות), ובמקומם נשלח `lead_submit_error` עם `error_type` המתאים. |
| 4 | **בדיקת רשת עם טוקן ריק: 0 בקשות אנליטיקה** | **עבר** (PASS) | ניטור כל בקשות הרשת בטעינת עמוד הבית (`/`) ועמוד הפנייה (`/contact/`) עם `cloudflare_analytics_token: ""` – נרשמו 0 בקשות ל-Cloudflare או לכל גורם אנליטיקה אחר. |
| 5 | **בדיקת טוקן מזויף: יצירת תגית תקינה ויירוט בקשה** | **עבר** (PASS) | בנייה עם קונפיגורציית טוקן מזויף (`dummy_cf_token_12345`). אומת קיום התגית `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "dummy_cf_token_12345"}'></script>`, הבקשה יורטה ובוטלה בדפדפן ולא יצאה לרשת, ואומת שהתגית אינה קיימת ב-`styleguide` וב-`404.html`. |
| 6 | **תקציב גודל קובץ `assets/js/site.js` עד 15KB** | **עבר** (PASS) | גודל הקובץ נמדד בבתים: **15,331 בתים** (תקרה: 15,360 בתים). |

---

## 3. טבלת 11 האירועים מ-§6.7

להלן פירוט כל 11 האירועים, תנאי ההפעלה, הפרמטרים המותרים, ושורת debug אמיתית שנלכדה מקונסול הדפדפן בהרצת הבדיקה:

| מס' | שם האירוע | תנאי הפעלה (טריגר) | פרמטרים מותרים | דוגמה משורת Debug אמיתית שנלכדה |
|:---:|---|---|---|---|
| 1 | `cta_click` | לחיצה על כפתור פנייה ראשי (`hero`, `header`, `cta-band`, `scenario-hero`) | `page`, `lang`, `location`, `target` | `[track] cta_click {"page":"/","lang":"he","location":"hero","target":"/contact/"}`<br>`[track] cta_click {"page":"/scenarios/recording-to-outputs/","lang":"he","location":"scenario-hero","target":"/contact/?from=scenario:recording-to-outputs"}` |
| 2 | `entry_choice` | לחיצה על אחת מדרכי הפתיחה בכרטיסי סעיף 2 | `page`, `lang`, `intent` | `[track] entry_choice {"page":"/","lang":"he","intent":"defined_process"}`<br>`[track] entry_choice {"page":"/","lang":"he","intent":"explore"}` |
| 3 | `scenario_view` | טעינת עמוד תרחיש | `page`, `lang`, `slug` | `[track] scenario_view {"page":"/scenarios/recording-to-outputs/","lang":"he","slug":"recording-to-outputs"}` |
| 4 | `domain_view` | טעינת עמוד תחום | `page`, `lang`, `slug` | `[track] domain_view {"page":"/solutions/customers/","lang":"he","slug":"customers"}` |
| 5 | `contact_view` | טעינת עמוד הפנייה | `page`, `lang`, `from` | `[track] contact_view {"page":"/contact/","lang":"he","from":"scenario:recording-to-outputs"}`<br>`[track] contact_view {"page":"/contact/","lang":"he","from":""}` |
| 6 | `form_start` | אינטראקציה ראשונה (focusin או input) עם שדה בטופס | `page`, `lang` | `[track] form_start {"page":"/contact/","lang":"he"}` |
| 7 | `form_submit` | לחיצה על כפתור השליחה לאחר אימות תקינות צד לקוח | `page`, `lang` | `[track] form_submit {"page":"/stub-contact/","lang":"he"}` |
| 8 | `lead_submit_success` | קבלת תגובת הצלחה 2xx מהשרת עם `ok !== false` | `page`, `lang` | `[track] lead_submit_success {"page":"/stub-contact/","lang":"he"}` |
| 9 | `lead_submit_error` | כשל בשליחת הפנייה (רשת, timeout, 5xx, rejected) | `page`, `lang`, `error_type` | `[track] lead_submit_error {"page":"/stub-contact/","lang":"he","error_type":"http_500"}`<br>`[track] lead_submit_error {"page":"/stub-contact/","lang":"he","error_type":"network"}`<br>`[track] lead_submit_error {"page":"/stub-contact/","lang":"he","error_type":"rejected"}` |
| 10 | `email_fallback_click` | לחיצה על קישור המייל בפאנל הכשל או על קישור המייל הישיר | `page`, `lang` | `[track] email_fallback_click {"page":"/stub-contact/","lang":"he"}`<br>`[track] email_fallback_click {"page":"/contact/","lang":"he"}` |
| 11 | `lang_switch` | לחיצה על קישור החלפת שפה (עברית/אנגלית) | `page`, `lang` | `[track] lang_switch {"page":"/","lang":"he"}` |

---

## 4. הוכחה שבלי טוקן אין בקשת מדידה (Network Requests Audit)

בבדיקת טעינת עמוד הבית ועמוד הפנייה עם הגדרת ברירת המחדל (`cloudflare_analytics_token: ""`), נרשמו בדיוק 16 בקשות רשת מקומיות ובקשות לגופני Google Fonts המורשים. **0 בקשות אנליטיקה או צד שלישי אחרות:**

```json
[
  { "method": "GET", "url": "http://127.0.0.1:4002/", "resourceType": "document" },
  { "method": "GET", "url": "https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Inter:wght@400;500;700&display=swap", "resourceType": "stylesheet" },
  { "method": "GET", "url": "http://127.0.0.1:4002/assets/css/site.css", "resourceType": "stylesheet" },
  { "method": "GET", "url": "http://127.0.0.1:4002/assets/logo-symbol.png", "resourceType": "image" },
  { "method": "GET", "url": "http://127.0.0.1:4002/assets/js/site.js", "resourceType": "script" },
  { "method": "GET", "url": "https://fonts.gstatic.com/s/heebo/v28/NGS6v5_NC0k9P9H2TbE.woff2", "resourceType": "font" },
  { "method": "GET", "url": "https://fonts.gstatic.com/s/heebo/v28/NGS6v5_NC0k9P9H0TbFzsQ.woff2", "resourceType": "font" },
  { "method": "GET", "url": "https://fonts.gstatic.com/s/heebo/v28/NGS6v5_NC0k9P9GYTbFzsQ.woff2", "resourceType": "font" },
  { "method": "GET", "url": "http://127.0.0.1:4002/contact/", "resourceType": "document" },
  { "method": "GET", "url": "https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700&family=Inter:wght@400;500;700&display=swap", "resourceType": "stylesheet" },
  { "method": "GET", "url": "http://127.0.0.1:4002/assets/css/site.css", "resourceType": "stylesheet" },
  { "method": "GET", "url": "http://127.0.0.1:4002/assets/logo-symbol.png", "resourceType": "image" },
  { "method": "GET", "url": "http://127.0.0.1:4002/assets/js/site.js", "resourceType": "script" },
  { "method": "GET", "url": "https://fonts.gstatic.com/s/heebo/v28/NGS6v5_NC0k9P9H0TbFzsQ.woff2", "resourceType": "font" },
  { "method": "GET", "url": "https://fonts.gstatic.com/s/heebo/v28/NGS6v5_NC0k9P9GYTbFzsQ.woff2", "resourceType": "font" },
  { "method": "GET", "url": "https://fonts.gstatic.com/s/heebo/v28/NGS6v5_NC0k9P9H2TbE.woff2", "resourceType": "font" }
]
```

---

## 5. הוכחה שעם טוקן מזויף נוצרת התגית הנכונה והבקשה יורטה

בקובץ קונפיגורציה ייעודי לבדיקה (`_dev/_config.dummy_analytics.yml`) הוגדר `cloudflare_analytics_token: "dummy_cf_token_12345"`. (הערת תיעוד L6: קובץ הקונפיגורציה הזמני לבדיקה וספריית הפלט הזמנית `_site_dummy/` שימשו רק לצורך אימות זה ולא נשמרו בריפו).

1. **תגית ה-DOM שנוצרה בעמוד הבית:**
   ```html
   <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "dummy_cf_token_12345"}'></script>
   ```
2. **יירוט הבקשה בדפדפן:**
   הבקשה ל-`https://static.cloudflareinsights.com/beacon.min.js` נלכדה ע"י מנגנון ה-Request Interception של Puppeteer ובוטלה מיידית (`req.abort()`), כך שלא יצאה כלל לרשת החיצונית.
   - כתובת שיורטה: `https://static.cloudflareinsights.com/beacon.min.js`
   - שיטה: `GET`
   - סטטוס יירוט: `intercepted: true, aborted: true`
3. **החרגה מ-Styleguide ומ-404:**
   - בעמוד `/styleguide/`: נסרק ה-DOM ואושר שאין שום תגית סקריפט של Cloudflare (`beacon_excluded_on_styleguide: true`).
   - בעמוד `/404.html`: נסרק ה-DOM ואושר שאין שום תגית סקריפט של Cloudflare (`beacon_excluded_on_404: true`).

---

## 6. מדידת גודל קובץ הסקריפט `assets/js/site.js`

- **גודל מדוד בבתים:** **15,331 בתים** (מדידה באמצעות `fs.statSync`).
- **מגבלת תקציב קשיחה לפי §6.5:** 15,360 בתים (15KB).
- **יתרת תקציב:** 29 בתים מתחת לתקרה.
- קוד המקור נותר קריא, מודולרי, מתועד בצורה תמציתית, וכולל את כל תכונות הנגישות, הניווט, הטופס, והמעקב הנדרשות.

---

## 7. תבנית גיליון ניהול לידים (§4.5)

בהתאם לסעיף §4.5 באפיון ("הטיפול בפנייה"), להלן הגדרת מבנה הרשומה בגיליון הלידים והסטטוסים לניהול הפניות:

### עמודות הגיליון:
1. `submitted_at` (תאריך ושעה ב-ISO 8601)
2. `name` (שם הפונה)
3. `email` (כתובת אימייל)
4. `organization` (שם הארגון)
5. `intent` (`defined_process` / `explore` / `other`)
6. `message` (ספרו לנו בכמה מילים)
7. `role` (תפקיד)
8. `phone` (טלפון)
9. `context_type` (`scenario` / `domain` / `none`)
10. `context_slug` (מזהה תרחיש או תחום)
11. `landing_page` (עמוד נחיתה ראשון בסשן)
12. `referrer_host` (דומיין מפנה)
13. `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
14. `lang` (`he` / `en`)
15. `status` (סטטוס הטיפול — פירוט להלן)
16. `rejection_reason` (סיבת אי-התאמה אם הסטטוס הוא `reviewed_not_now`)
17. `notes` (הערות גדי)

### סטטוסי רשומה ומשמעותם:
| סטטוס | משמעות |
|---|---|
| `new` | פנייה חדשה שטרם נקראה |
| `reviewed_fit` | נקראה ונמצאה מתאימה לשיחת היכרות (לפי קריטריוני המייסד d25) |
| `reviewed_not_now` | לא כרגע. מצורפת סיבה קבועה מתוך: `לא ארגון` · `חיפוש עבודה או ספק` · `לא רלוונטי` · `אין יכולת להשקיע כעת` · `אחר` |
| `call_scheduled` | נקבע מועד לשיחת היכרות |
| `call_held` | שיחת ההיכרות התקיימה |
| `in_progress` | המשך התקשרות: הצעת עבודה או תחילת תהליך |
| `won` / `lost` / `paused` | פנייה שנסגרה בהצלחה / לא נסגרה / הוקפאה |

---

## 8. שאלות פתוחות והחלטות שמרניות

1. **פרמטר `target` ב-`cta_click`:**
   בחרנו לקרוא ישירות את ה-`href` המוגדר בתבנית של כפתור הפנייה (לדוגמה `/contact/` בעמוד הבית או `/contact/?from=scenario:recording-to-outputs` בעמודי תרחיש). (הערת תיעוד L6: אף שסעיף §6.7 מונה את `target` כפרמטר מותר ללא הצגת דוגמה מפורשת באפיון, השימוש ב-`href` התבניתי מספק שיוך מדויק ללא קלט משתמש).
2. **הפעלת `email_fallback_click`:**
   האירוע מופעל הן בעת לחיצה על כפתור המייל החלופי בפאנל הכשל (`#btn-mailto-fallback`) והן בעת לחיצה על קישורי מייל ישירים בעמוד הפנייה (`.direct-mail-link`), בהתאם להנחיות סעיף 3 ב-WP5.
3. **החרגת תגית ה-Analytics:**
   התגית מוחרגת בעמוד ה-`styleguide` (שמוגדר עם `sitemap: false`) ובעמוד `404.html` (שהוגדר לו במפורש `noindex: true` בפרונט-מטר לפי שורה 870 באפיון), על מנת להבטיח שרק עמודים ציבוריים מאונדקסים ייספרו.

---

## 9. תיקוני WP5-fix: ‏F1/F2

חבילת תיקון ממוקדת זו (WP5-fix) בוצעה בהתאם להנחיות Claude במסמך `claude_next_execution_packet_2026-10-30.md`, וטיפלה בשני ממצאי הקבלה F1 ו-F2 מדוח `wp5_claude_acceptance_2026-10-30.md`.

### פירוט השינויים שבוצעו:

1. **F1: שחזור מראה קישור השפה במגירת המובייל (`_includes/header.html` ו-`assets/js/site.js`)**:
   - `_includes/header.html` (שורות 104, 106): הוסרה המחלקה `class="lang-switch"` משני קישורי השפה במגירת המובייל (הושארו מאפייני `hreflang` ו-`lang`). בכך בוטלה החלת עיצוב כפתור ה-Pill של הכותרת, ומראה קישורי השפה הושווה לחלוטין לשאר קישורי המגירה (`ul.drawer-links-direct`).
   - `assets/js/site.js` (בפונקציה `initGlobalTracking`, שורה 103): הוחלף הסלקטור מ-`t.closest('.lang-switch')` ל-`t.closest('a[hreflang]')`. בתוך גוף הדף רק ששת קישורי מעבר השפה נושאים מאפיין `hreflang`, ולכן האירוע `lang_switch` נלכד במדויק גם בכותרת הדסקטופ וגם במגירת המובייל.

2. **F2: מניעת זליגת ערך גולמי בפרמטר `from` באירוע `contact_view` (`assets/js/site.js`)**:
   - `assets/js/site.js` (בפונקציה `initContactForm`, שורות 137–160):
     - קריאת `track('contact_view', ...)` הועברה אל אחרי בלוק פענוח ה-`catalog`.
     - הפרמטר `from` נשלח אך ורק במידה ופוענח כערך מוכר:
       - צמד `type:slug` מאומת שקיים ב-`catalog` (נבנה מחדש מ-`type + ':' + slug`, כך שערכים זרים כמו כתובת אימייל שצורפה בסוף מנוקים לחלוטין).
       - הערך המילולי המאושר `menu:all_solutions`.
       - כל ערך זר אחר שנמסר ב-`from` ממופה למחרוזת `'other'`.
       - בהיעדר פרמטר `from`, נשלחת מחרוזת ריקה `''`.
     - שאר התנהגות הטופס, פס ההקשר, ואירוע `form_start` נותרו ללא שינוי.

3. **שמירה על תקציב הגודל של `site.js`**:
   - קוצרו הערת הכותרת (שורות 2–3) והערת ה-`dispatch` (שורות 66–67).
   - גודל הקובץ הסופי: **15,289 בתים** (תקרה: 15,360 בתים; מרווח פנוי: 71 בתים).

### טבלת תוצאות הבדיקות האוטומטיות (a עד d):

| בדיקה | תיאור ובדיקה שבוצעה | ערך צפוי | ערך שנמדד | תוצאה |
|:---:|---|---|---|:---:|
| **(a)** | **מראה המגירה (F1)**<br>השוואת 6 מאפייני `getComputedStyle` בין קישור השפה לקישור האח "איך אנחנו עובדים" ב-`ul.drawer-links-direct` (ברוחב 390px, הן ב-`/` והן ב-`/en/`) | כל 6 הערכים זהים לחלוטין בשתי השפות: `border-top-width`, `border-radius`, `background-color`, `font-weight`, `padding-inline-start`, `min-height` | זהות מלאה (`allEqual: true`). נשמרו צילומי מסך ב-`_dev/shots/wp5fix/` (`drawer_he_390.png`, `drawer_en_390.png`) | **PASS** |
| **(b.1)** | **אירוע `lang_switch` במגירה**<br>לחיצה על קישור השפה במגירת המובייל (390px) עם `?debug=track` | שורת לוג יחידה בדיוק: `[track] lang_switch` וללא אירוע נוסף | נרשם בדיוק אירוע אחד:<br>`[track] lang_switch {"page":"/","lang":"he"}` | **PASS** |
| **(b.2)** | **אירוע `lang_switch` בכותרת**<br>לחיצה על כפתור EN בכותרת הדסקטופ (1280px) עם `?debug=track` | שורת לוג יחידה בדיוק: `[track] lang_switch` וללא אירוע נוסף | נרשם בדיוק אירוע אחד:<br>`[track] lang_switch {"page":"/","lang":"he"}` | **PASS** |
| **(c.1)** | **אירוע `contact_view` (תרחיש תקין)**<br>`/contact/?from=scenario:recording-to-outputs&debug=track` | `from: "scenario:recording-to-outputs"` | `from: "scenario:recording-to-outputs"` (אירוע בודד, ללא `form_start`) | **PASS** |
| **(c.2)** | **אירוע `contact_view` (אימייל גולמי)**<br>`/contact/?from=jane@example.com&debug=track` | `from: "other"`, ללא תווים אישיים (`@`) | `from: "other"` (שום `@` לא מופיע בפלט) | **PASS** |
| **(c.3)** | **אירוע `contact_view` (תרחיש + אימייל מוצמד)**<br>`/contact/?from=scenario:recording-to-outputs:jane@example.com&debug=track` | `from: "scenario:recording-to-outputs"`, ללא תווים אישיים (`@`) | `from: "scenario:recording-to-outputs"` (שום `@` לא מופיע בפלט) | **PASS** |
| **(c.4)** | **אירוע `contact_view` (מזהה שאינו בקטלוג)**<br>`/contact/?from=scenario:no-such-slug&debug=track` | `from: "other"` | `from: "other"` | **PASS** |
| **(c.5)** | **אירוע `contact_view` (ערך מאושר מילולית)**<br>`/en/contact/?from=menu:all_solutions&debug=track` | `from: "menu:all_solutions"` | `from: "menu:all_solutions"` | **PASS** |
| **(c.6)** | **אירוע `contact_view` (ללא פרמטר `from`)**<br>`/contact/?debug=track` | `from: ""` | `from: ""` | **PASS** |
| **(d)** | **גודל קובץ `assets/js/site.js`**<br>מדידת גודל הקובץ בבתים | עד 15,360 בתים (15KB) | **15,289 בתים** (71 בתים מרווח פנוי) | **PASS** |
| **רשת** | **בידוד רשת ואנליטיקה**<br>ניטור בקשות רשת במהלך כל הבדיקות | 0 בקשות ל-Cloudflare Web Analytics ול-Google Apps Script | 0 בקשות (`cloudflare: 0, script.google: 0`) | **PASS** |

### קבצי ראיות שנשמרו:
- סקריפט אימות ייעודי: `_dev/run_wp5_fix_validation.js`
- קובץ תוצאות מפורט ב-JSON: `_dev/wp5_fix_validation_results.json`
- צילומי מסך של המגירה ב-390px:
  - `_dev/shots/wp5fix/drawer_he_390.png`
  - `_dev/shots/wp5fix/drawer_en_390.png`

### חריגות או מגבלות:
אין חריגות מדרישות חבילת התיקון. כל הבדיקות a עד d עברו בהצלחה מלאה, מקומית, מול `_site_stub`, ללא תלות ברשת חיצונית וללא חריגה מתקציב הקוד.

---

## 10. קבלת Claude

**החלטה: WP5 התקבלה (ACCEPTED), עם המגבלות L1 עד L5.**
- סוקר: Claude, בעלי בדיקת הקוד והאיכות לפי d07.
- תאריך: 30.10.2026, 23:25 בערך.
- זו קבלה טכנית בלבד. היא לא מאשרת מיזוג ל־main או פרסום.

### על מה נבדק
- ה־HEAD שנבדק: `692e84c7`. הענף site-v2 לא נדחף ואין לו upstream. main נשאר `e2f9052`.
- הקבלה מבוססת על הרצה עצמאית של Claude ולא על הדיווח של המבצע:
  - העתק נקי של `692e84c` חולץ ב־`git archive` לתיקייה זמנית מחוץ לריפו.
  - נבנה עם `_config.yml,_dev/_config.stub.yml`, כשהטוקן ריק.
  - הוגש על 127.0.0.1:4012. השרת על 4000 לא נגע.
  - כל בקשה שאינה ל־127.0.0.1 בוטלה ונרשמה. נרשמו רק בקשות ל־fonts.googleapis.com. לא היו בקשות ל־Cloudflare או לקולט.
- סקריפט הבדיקה: `_dev/run_wp5_claude_acceptance.js`. התוצאות: `_dev/wp5_claude_acceptance_results.json`.
- ביקורת שלילית: אותו סקריפט הורץ על `05b324a`, לפני התיקון. הוא נכשל בבדיקה (a) ובשלושת מקרי ה־from הלא מוכרים. כלומר, הבדיקה באמת מזהה את הליקויים.

### ה־diff
- `05b324a..692e84c` נוגע רק בקבצים המותרים:
  - `_includes/header.html`: הוסר `class="lang-switch"` בשורות 104 ו־106.
  - `assets/js/site.js`: הסלקטור הוחלף ל־`a[hreflang]`, נוספו `fromOk` ו־contact_view שמגיע אחרי זיהוי ה־catalog, והערות קוצרו.
  - ראיות ודוח תחת `_dev/`.
- ה־diff תואם לחבילה `claude_next_execution_packet_2026-10-30.md` ולא כולל שינוי אחר.

| בדיקה | צפוי | נמדד (Claude) | תוצאה |
|---|---|---|---|
| (a) מגירה ב־390px, ‏`/` | 6 המאפיינים של קישור השפה זהים לקישור האח, ואין class | זהים: 0px/0px/transparent/400/0px/0px, ‏class ריק | PASS |
| (a) מגירה ב־390px, ‏`/en/` | כנ"ל | זהים | PASS |
| (b) קישור השפה במגירה, ‏he ו־en | שורת `[track] lang_switch` אחת בלבד | שורה אחת בכל לחיצה | PASS |
| (b) כפתור EN בכותרת, ‏1280px | שורת `lang_switch` אחת בלבד | שורה אחת | PASS |
| (c) `scenario:recording-to-outputs` | `scenario:recording-to-outputs` | זהה | PASS |
| (c) `jane@example.com` | `other`, בלי @ | `other`, בלי @ | PASS |
| (c) `scenario:recording-to-outputs:jane@example.com` | `scenario:recording-to-outputs`, בלי @ | זהה, בלי @ | PASS |
| (c) `scenario:no-such-slug` | `other` | `other` | PASS |
| (c) `/en/contact/?from=menu:all_solutions` | `menu:all_solutions` | זהה | PASS |
| (c) בלי from | `""` | `""` | PASS |
| (c) בכל המקרים | contact_view אחד, בלי form_start בלי אינטראקציה | התקיים | PASS |
| (d) `git cat-file -s HEAD:assets/js/site.js` | עד 15,360 | **15,289**, כלומר 71 בתים פנויים | PASS |

ממצאי הסקירה F1 ו־F2 נסגרו. גם תיקוני התיעוד מ־L6 בוצעו, בסעיפים §1.3, §5 ו־§8.1.

### מגבלות שהתקבלו
- **L1 עד L5** כמפורט בסקירה `docs/coordination/wp5_claude_acceptance_2026-10-30.md` §3. ללא שינוי.
- **L8 (נמוכה, חדשה):** בדיקת ה־catalog משתמשת ב־`catalog[type][slug]`, ולכן שמות תכונות מובנים של JavaScript עוברים אותה. למשל `?from=scenario:constructor` נותן `from:"scenario:constructor"`.
  - אין כאן פרט אישי. הערך מוגבל לקבוצה קבועה של שמות מובנים, ולא לטקסט חופשי.
  - ההתנהגות של פס ההקשר והשדות המוסתרים בכתובת כזו קיימת עוד לפני WP5, מאז `c785bc1`.
  - לתקן ב־`Object.hasOwn` כשמחברים dispatch, או בחבילת קוד הבאה.
- **L9 (תיעודית):** ב־`_dev/wp5_fix_validation_results.json` של המבצע רשום `tested_head: 16b4717`, אבל שינוי F2 עוד לא היה אז ב־commit. הריצה העצמאית של Claude על `692e84c` מכסה את הקוד הסופי.

### תנאים ל־WP6
התנאים נמצאים בסקירה, §6.
- תנאים 1 עד 4 מתקיימים:
  - יש commit תיקון, וקבלה זו כתובה כאן.
  - הראיות נשמרו ב־`_dev/`.
  - `site.js` הוא 15,289 בתים, כך שב־WP6 יש לכל היותר 71 בתים פנויים ל־JS.
  - main הוא `e2f9052`, ושום דבר לא נדחף.
- תנאים 5 ו־6 נשארים פתוחים:
  - פעולות בעלים ב־Cloudflare ובדיקת HTTPS ב־GitHub Pages נכנסות לרשימת WP6.
  - מיזוג ל־main ממתין להחלטה B5 של גדי.
- WP6 לא הופעלה.
