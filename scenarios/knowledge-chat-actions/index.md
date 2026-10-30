---
layout: scenario
lang: he
scenario: knowledge-chat-actions
domain: knowledge-and-teams
title: "תשובות מהידע של הארגון ופעולות במערכות, מתוך שיחה אחת"
description: "עובדים שואלים בשפה חופשית ומקבלים תשובה מתוך הידע של הארגון, עם מקור. הם יכולים גם לבצע פעולות מוגדרות במערכות בלי לחפש מסכים."
---

<!-- 3. Work Today (Spec §3.4, סעיף 3) -->
<section class="section section-alt" id="work-today">
  <div class="container">
    <div class="section-header">
      <h2>העבודה היום</h2>
    </div>
    <p class="text-lead content-measure-70">
      מידע פזור בין נהלים, מסמכים ומערכות. עובדים מבזבזים זמן בחיפוש, שואלים את אותן שאלות שוב ושוב, ומבצעים פעולות פשוטות דרך מסכים מורכבים.
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
            העובד שואל או מבקש.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">2</span>
          </div>
          <div class="flow-card-text">
            המערכת מזהה את העובד ואת ההרשאות שלו.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">3</span>
          </div>
          <div class="flow-card-text">
            היא מחפשת במסמכים, בנהלים ובמאגרים.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">4</span>
          </div>
          <div class="flow-card-text">
            היא מחזירה תשובה עם מקור, או מבצעת פעולה מוגדרת, כמו פתיחת קריאה, בירור סטטוס או עדכון.
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
            פעולה רגישה מתבצעת רק אחרי אישור.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">6</span>
          </div>
          <div class="flow-card-text">
            הבקשה מתועדת, והמידע מסייע לשפר את הידע.
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
            <div>תשובה עם הפניה למקור</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>סיכום מסמך ארוך</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>ביצוע פעולה מתוך השיחה</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>תמונת מצב של השאלות הנפוצות</div>
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
            <div>גישה למקורות הידע</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>בעלים לכל מקור ידע</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>החלטה על הרשאות</div>
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
        <div>מקורות ידע</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>הממשק: באתר הפנימי או בכלי העבודה הקיים של הארגון</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>הרשאות לפי תפקיד</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>אילו פעולות זמינות</div>
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
        <summary class="faq-summary">איפה רצה המערכת?</summary>
        <div class="faq-content">
          <p>אפשר לבנות את הפתרון על התשתית שלנו, או בענן שהארגון כבר עובד איתו, כמו <bdi>Google Cloud</bdi>,‏ <bdi>Microsoft Azure</bdi> או <bdi>AWS</bdi>. הבחירה נעשית לפי המערכות, הדרישות והתקציב שלכם.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">מי מאשר פעולות ותוצרים?</summary>
        <div class="faq-content">
          <p>מגדירים יחד אילו פעולות מותרות, מתי אדם מאשר, ומה מתועד.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">איך מתחברים למערכות?</summary>
        <div class="faq-content">
          <p>הצ׳אט מתחבר למאגרי המסמכים ולמערכות שבהן מבצעים פעולות. ההרשאות נלקחות מהמערכות הקיימות של הארגון. בודקים יחד איזו גישה אפשרית, ישירות או דרך ספק המערכות.</p>
        </div>
      </details>
    </div>
  </div>
</section>

<!-- 10 & 11. CTA & Next Steps (Spec §3.4, סעיפים 10-11) -->
{% include cta-band.html title="רוצים לבדוק איך זה ייראה אצלכם?" button="לשיחה על התרחיש הזה" from="scenario:knowledge-chat-actions" %}

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
        <a href="{{ '/solutions/knowledge-and-teams/' | relative_url }}" class="domain-card-link">לעמוד התחום ›</a>
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
