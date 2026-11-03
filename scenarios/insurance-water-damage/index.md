---
layout: scenario
lang: he
scenario: insurance-water-damage
story: insurance-water-damage
domain: operations
redirect_from:
  - /scenarios/knowledge-chat-actions/
title: "פנייה בביטוח עם מסמכים ותמונות, שמועברת לסוכנת עם כל ההקשר"
description: "פניות על נזק או אירוע ביטוחי מתחילות בוואטסאפ: הסוכן מזהה, מרכז תמונות ומסמכים, מזהה חוסרים, ומעביר לסוכנת תיק מסודר להחלטה והמשך טיפול."
---

<!-- 3. Work Today (Spec §3.4, סעיף 3) -->
<section class="section section-alt" id="work-today">
  <div class="container">
    <div class="section-header">
      <h2>העבודה היום</h2>
    </div>
    <p class="text-lead content-measure-70">
      כאשר מבוטח פונה בעקבות נזק מים או אירוע בבית, התמונות והמסמכים מגיעים בהודעות נפרדות ובערוצים שונים. בסוכנות הביטוח מנסים לאתר את הפרטים, חוזרים אליו שוב ושוב להשלמות, ומתחילים מחדש בכל פעם שמסמך חסר.
    </p>
  </div>
</section>

<!-- 4. How It Works - Flow Component (Spec §3.4, סעיף 4, §5.5) -->
<section class="section" id="how-it-works">
  <div class="container">
    <div class="section-header">
      <h2>איך זה עובד</h2>
    </div>

    <div class="flow-container">
      <ol class="flow-steps">
        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">1</span>
          </div>
          <div class="flow-card-text">
            המבוטח פונה בוואטסאפ ושולח תמונות של הנזק.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">2</span>
          </div>
          <div class="flow-card-text">
            הסוכן הדיגיטלי מזהה את הפנייה ומאתר את התיק.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">3</span>
          </div>
          <div class="flow-card-text">
            הוא בודק מה כבר נמצא בתיק ומה עוד חסר כדי להתחיל לטפל.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">4</span>
          </div>
          <div class="flow-card-text">
            המבוטח משלים את המסמכים החסרים באותה שיחה, בלי להתחיל מחדש.
          </div>
        </li>

        <li class="flow-card" data-human="true">
          <div class="flow-card-header">
            <span class="flow-card-num">5</span>
            <span class="flow-human-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>אדם</span>
            </span>
          </div>
          <div class="flow-card-text">
            הסוכן מעביר את הפנייה, סיכום ההתכתבות והמסמכים לבדיקת הסוכנת.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">6</span>
          </div>
          <div class="flow-card-text">
            הסוכנת מקבלת תיק מעודכן ומסודר, בודקת ומחליטה איך להמשיך בטיפול.
          </div>
        </li>
      </ol>
    </div>
  </div>
</section>

<!-- 5 & 7. What You Get & What We Need From You (Spec §3.4, סעיפים 5, 7) -->
<section class="section section-alt" id="deliverables">
  <div class="container">
    <div class="deliverables-grid">
      
      <!-- What You Get -->
      <div>
        <div class="section-header">
          <h2>מה אפשר לקבל</h2>
        </div>
        <div class="fit-grid fit-grid-single">
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>ריכוז תמונות ומסמכים לתיק פנייה אחד</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>בדיקת שלמות וזיהוי מסמכים חסרים מול הלקוח</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>תקשורת מהירה בערוץ שנוח למבוטח</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>העברת תיק מסודר ומלא עם כל ההקשר לסוכנת</div>
          </div>
        </div>
      </div>

      <!-- What We Need From You -->
      <div>
        <div class="section-header">
          <h2>מה צריך מצדכם</h2>
        </div>
        <div class="fit-grid fit-grid-single">
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>הגדרת סוגי הפניות והמסמכים הדרושים</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>חיבור למערכת ניהול התיקים או ה־CRM</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>הגדרת נקודת המעבר לבדיקה והחלטה אנושית</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- 6. Adaptation (Spec §3.4, סעיף 6) -->
<section class="section" id="adaptation">
  <div class="container">
    <div class="section-header">
      <h2>התאמה לארגון שלכם</h2>
    </div>

    <div class="fit-grid">
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>ערוץ הפנייה: WhatsApp, פורטל לקוחות או דוא״ל</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>סוגי האירועים: נזקי מים, רכב, דירה או ביטוח עסקי</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>מערכות הליבה וההרשאות של הסוכנות</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>מסלול ההעברה לנציג או לסוכנת המטפלת</div>
      </div>
    </div>
  </div>
</section>

<!-- 8. Evidence Block (Spec §3.4, סעיף 8, conditional) -->
{% for s in site.data.scenarios %}
  {% if s.slug == page.scenario %}
    {% include evidence-block.html evidence=s.evidence %}
  {% endif %}
{% endfor %}

<!-- 9. FAQ (Spec §3.4, סעיף 9) -->
<section class="section section-alt" id="faq">
  <div class="container container-measure-80">
    <div class="section-header">
      <h2>שאלות נפוצות</h2>
    </div>

    <div class="faq-list">
      <details class="faq-item" open>
        <summary class="faq-summary">האם הסוכן מאשר תביעות או מבטיח תשלום?</summary>
        <div class="faq-content">
          <p>לא. המערכת מרכזת את המידע, בודקת שלמות מסמכים ומכינה את התיק. כל החלטה מהותית או אישור טיפול מתבצעים על ידי הסוכנת או החתם האנושי.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">איך נשמר הקשר בין ההודעות למסמכים?</summary>
        <div class="faq-content">
          <p>כל התמונות, המסמכים וההתכתבות מקושרים לתיק הפנייה, כך שכל מי שנכנס לטפל רואה תמונה מלאה ומעודכנת.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">איפה רצה המערכת?</summary>
        <div class="faq-content">
          <p>אפשר לבנות את הפתרון על התשתית שלנו, או בענן שהארגון כבר עובד איתו, כמו <bdi>Google Cloud</bdi>,‏ <bdi>Microsoft Azure</bdi> או <bdi>AWS</bdi>. הבחירה נעשית לפי המערכות, הדרישות והתקציב שלכם.</p>
        </div>
      </details>
    </div>
  </div>
</section>

<!-- 10 & 11. CTA & Next Steps (Spec §3.4, סעיפים 10-11) -->
{% include cta-band.html title="רוצים לבדוק איך זה ייראה אצלכם?" button="לשיחה על התרחיש הזה" from="scenario:insurance-water-damage" %}

<section class="section" id="next-steps">
  <div class="container">
    <div class="section-header">
      <h2>תרחישים קשורים</h2>
    </div>

    <div class="domains-grid">
      {% for d in site.data.domains %}{% if d.slug == page.domain %}
      <div class="domain-card">
        <h3>{{ d.he.title }}</h3>
        <p class="domain-framing">{{ d.he.framing }}</p>
        <a href="{{ '/solutions/operations/' | relative_url }}" class="domain-card-link">לעמוד התחום ›</a>
      </div>
      {% endif %}{% endfor %}
      {% assign related = "agent-assist-onboarding,documents-across-systems" | split: "," %}
      {% for slug in related %}
      {% assign rel = site.data.scenarios | where: "slug", slug | first %}
      {% include scenario-card.html scenario=rel %}
      {% endfor %}
    </div>

    <p class="mt-6"><a href="{{ '/how-we-work/' | relative_url }}" class="domain-card-link">איך עובדים ›</a></p>
  </div>
</section>
