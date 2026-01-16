# PowOrg - אתר תדמית

אתר תדמית מודרני לשירות AI ארגוני עם ליווי POC והטמעה מלאה.

## 🌐 כתובת האתר

האתר מתארח ב-GitHub Pages:
- **URL**: https://gadysh.github.io/
- **דומיין מותאם אישית** (בעתיד): poworg.com

## 📁 מבנה הפרויקט

```
gadysh.github.io/
├── index.html              # עמוד הבית
├── pages/
│   ├── poc.html           # עמוד תהליך POC
│   └── security.html      # עמוד אבטחה ופרטיות
├── css/
│   └── styles.css         # כל העיצוב (RTL, responsive, dark theme)
├── js/
│   ├── main.js           # לוגיקה ראשית
│   ├── content-loader.js # טעינת Markdown
│   └── animations.js     # אנימציות GSAP
├── content/
│   ├── home.md           # תוכן עמוד הבית
│   ├── poc.md            # תוכן POC
│   ├── security.md       # תוכן אבטחה
│   └── usecases/         # תיקיית מקרי שימוש
│       ├── 001-customer-service.md
│       ├── 002-legal-docs.md
│       ├── ...
│       └── 008-quality-control.md
├── data/
│   └── site.json         # קונפיגורציה (מספר וואטסאפ, מייל, וכו')
└── assets/
    ├── img/
    │   └── og-image.png  # תמונת שיתוף לרשתות חברתיות
    └── icons/
        └── favicon.svg   # אייקון האתר
```

## ✏️ איך לערוך תוכן?

### שינוי טקסטים בעמודים

כל התוכן נמצא בקבצי **Markdown** בתיקיית `content/`. 

**לעריכת עמוד הבית:**
1. פתחו את `content/home.md`
2. ערכו את הטקסטים (הכותרות מסומנות ב-`##`)
3. שמרו את הקובץ
4. בצעו commit ו-push ל-GitHub

**לעריכת עמוד POC:**
- ערכו את `content/poc.md`

**לעריכת עמוד אבטחה:**
- ערכו את `content/security.md`

### הוספת מקרה שימוש חדש

1. צרו קובץ חדש בתיקיית `content/usecases/`
2. קראו לו: `009-שם-המקרה.md` (המספר הבא ברצף)
3. השתמשו במבנה הבא:

```markdown
<!-- icon: 🎯 -->
<!-- tags: תג1, תג2, תג3 -->

# כותרת מקרה השימוש

> משפט אחד שמסכם את מה שזה עושה

## מה נכנס?

- רשימה של inputs
- דוגמאות למה שהמערכת מקבלת

## מה יוצא?

- רשימה של outputs
- מה המערכת מספקת

## איך מודדים הצלחה?

- מדדי הצלחה כמותיים
- ROI, זמן, דיוק וכו'
```

4. הוסיפו את שם הקובץ לרשימה ב-`js/content-loader.js` בפונקציה `loadUseCases()` (בשורה שמתחילה ב-`const files = [...]`)
5. שמרו, commit, push

### עדכון פרטי התקשרות

ערכו את `data/site.json`:

```json
{
  "contact": {
    "email": "info@poworg.com",
    "phone": "+972-50-000-0000",
    "whatsapp": "972500000000",
    "whatsappMessage": "שלום, אני מעוניין לשמוע עוד..."
  }
}
```

- **whatsapp**: מספר בפורמט בינלאומי ללא + (972...)
- **whatsappMessage**: ההודעה שנפתחת אוטומטית בוואטסאפ

### החלפת תמונות

**תמונת Open Graph (שיתוף ברשתות חברתיות):**
- החליפו את `assets/img/og-image.png` בתמונה חדשה
- גודל מומלץ: 1200x630 פיקסלים

**אייקון האתר (favicon):**
- החליפו את `assets/icons/favicon.svg`

## 🚀 איך לפרוס (Deploy)?

האתר מתעדכן **אוטומטית** בכל push ל-branch `main`:

1. ערכו את הקבצים הרצויים
2. בצעו commit:
   ```bash
   git add .
   git commit -m "עדכון תוכן"
   ```
3. העלו ל-GitHub:
   ```bash
   git push origin main
   ```
4. המתינו 1-2 דקות - האתר יתעדכן אוטומטית!

## 🧪 בדיקה מקומית

לפני העלאה ל-GitHub, תוכלו לראות את האתר מקומית:

### אופציה 1: Python HTTP Server
```bash
# בתיקיית הפרויקט, הריצו:
python -m http.server 8000

# פתחו בדפדפן:
# http://localhost:8000
```

### אופציה 2: VS Code Live Server
1. התקינו את הרחבת "Live Server" ב-VS Code
2. לחצו ימין על `index.html` → "Open with Live Server"

## 🎨 התאמות עיצוב

### שינוי צבעים

ערכו את `css/styles.css` בתחילת הקובץ (`:root`):

```css
:root {
  --color-accent-primary: #00d4ff;    /* תכלת */
  --color-accent-secondary: #7c3aed;  /* סגול */
  /* ... */
}
```

### שינוי פונט

הפונט הנוכחי: **Heebo** (עברית מודרנית)

להחלפה:
1. חפשו פונט ב-[Google Fonts](https://fonts.google.com/?subset=hebrew)
2. העתיקו את ה-`<link>` החדש ל-`<head>` בכל קובץ HTML
3. עדכנו ב-`css/styles.css`:
   ```css
   --font-family: 'שם-הפונט-החדש', sans-serif;
   ```

## 🔧 טכנולוגיות

- **HTML5** - מבנה סמנטי
- **CSS3** - עיצוב RTL responsive
- **JavaScript (ES6 Modules)** - לוגיקה
- **Marked.js** - המרת Markdown ל-HTML
- **GSAP + ScrollTrigger** - אנימציות
- **Google Fonts (Heebo)** - טיפוגרפיה

## 📱 תמיכה בדפדפנים

- Chrome/Edge - ✅
- Firefox - ✅
- Safari - ✅
- Mobile browsers - ✅

## ♿ נגישות

- תמיכה מלאה ב-`prefers-reduced-motion`
- ARIA labels על כפתורים
- ניווט במקלדת
- צבעים בניגודיות גבוהה

## 🔒 אבטחה

- כל התוכן סטטי - אין חשיפה למאגר נתונים
- HTTPS אוטומטי דרך GitHub Pages
- אין cookies או tracking מובנה

## 📞 תמיכה

שאלות? פנו אל:
- **Email**: info@poworg.com
- **WhatsApp**: [לפי המספר שהוגדר ב-site.json]

---

**גרסה**: 1.0  
**עדכון אחרון**: 2026-01-16  
**פותח על ידי**: Antigravity AI
