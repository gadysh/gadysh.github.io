---
layout: scenario
lang: he
scenario: recording-to-outputs
domain: customers
story: recording-to-outputs
title: "כמה תוצרים מהקלטה אחת"
description: "מהקלטה של שיחת טלפון, פגישה או שיחת מכירה מתקבלים כמה תוצרים: סיכום ללקוח, תיעוד ב־CRM, המלצה להמשך, וניתוח איכות ולמידה."
---

<!-- 3. Work Today (Spec §3.4, סעיף 3) -->
<section class="section section-alt" id="work-today">
  <div class="container">
    <div class="section-header">
      <h2>העבודה היום</h2>
    </div>
    <p class="text-lead content-measure-70">
      אחרי שיחה או פגישה, מישהו צריך לסכם, לשלוח ללקוח, לתעד במערכת ולתכנן את ההמשך. לעתים קרובות זה נעשה חלקית, באיחור או לא נעשה. הידע מהשיחות כמעט לא משמש ללמידה.
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
            ההקלטה מגיעה ממערכת הטלפוניה, מכלי הפגישות או מהעלאה.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">2</span>
          </div>
          <div class="flow-card-text">
            ההקלטה מתומללת ומעובדת.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">3</span>
          </div>
          <div class="flow-card-text">
            התוצרים מופקים לפי סוג השיחה ולפי הקהל.
          </div>
        </li>

        <li class="flow-card" data-human="true">
          <div class="flow-card-header">
            <span class="flow-card-num">4</span>
            <span class="flow-human-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>אדם</span>
            </span>
          </div>
          <div class="flow-card-text">
            <strong>איש הקשר בודק את הסיכום ללקוח ומאשר אותו לפני השליחה.</strong> זו ברירת מחדל שאפשר לשנות.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">5</span>
          </div>
          <div class="flow-card-text">
            התיעוד מתויק ב־<bdi>CRM</bdi> ובמערכות.
          </div>
        </li>

        <li class="flow-card">
          <div class="flow-card-header">
            <span class="flow-card-num">6</span>
          </div>
          <div class="flow-card-text">
            ניתוח מצטבר משמש ללמידה ולהדרכה.
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
            <div>סיכום ללקוח, עם ההצעות והפרטים שעלו</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>סיכום פנימי שמתויק ב־<bdi>CRM</bdi></div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>משימות והמלצה לשיחת ההמשך</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>בדיקה של עמידת השיחה ביעדים שהארגון הגדיר</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>תובנות מצטברות להדרכת הצוות</div>
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
            <div>מקור הקלטות</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>דוגמאות לתוצר הרצוי</div>
          </div>
          <div class="fit-item">
            <span class="fit-icon" aria-hidden="true">✓</span>
            <div>מי שמוביל את השינוי בצוות</div>
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
        <div>סוגי שיחות: מכירה, שירות, פגישות פנימיות, ראיונות</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>שפה</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>תבניות התוצרים לכל קהל</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>מערכות יעד</div>
      </div>
      <div class="fit-item">
        <span class="fit-icon" aria-hidden="true">✓</span>
        <div>איך משלבים את ההקלטה בעבודה ובמפגש עם הלקוח, כולל ההסבר ללקוח וההסכמה להקלטה לפי הכללים שחלים על הארגון</div>
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
          <p>את הפיתרון אפשר לבנות כמעט בכל תצורה, על שרתי הארגון מקומית (<bdi>OnPrem</bdi>) או בענן (<bdi>Google Cloud</bdi>,‏ <bdi>Microsoft Azure</bdi> או <bdi>AWS</bdi>). הבחירה נעשית לפי המערכות, הדרישות והתקציב שלכם.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">מי מאשר פעולות ותוצרים?</summary>
        <div class="faq-content">
          <p>מגדירים יחד אילו פעולות מותרות, מתי אדם מאשר, ומה מתועד. בתרחיש הזה איש הקשר בודק את הסיכום ללקוח ומאשר אותו לפני השליחה. זו ברירת מחדל, ואפשר לשנות אותה.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-summary">איך מתחברים למערכות?</summary>
        <div class="faq-content">
          <p>ההקלטה מגיעה ממערכת הטלפוניה, מכלי הפגישות או מהעלאה, והתיעוד מתויק ב־<bdi>CRM</bdi> ובמערכות. בודקים יחד איזו גישה אפשרית, ישירות או דרך ספק המערכות.</p>
        </div>
      </details>
    </div>
  </div>
</section>

<!-- 10 & 11. CTA & Next Steps (Spec §3.4, סעיפים 10-11) -->
{% include cta-band.html title="רוצים לבדוק איך זה ייראה אצלכם?" button="לשיחה על התרחיש הזה" from="scenario:recording-to-outputs" %}

<section class="section" id="next-steps">
  <div class="container">
    <div class="section-header">
      <h2>תרחישים קשורים</h2>
    </div>

    <div class="domains-grid">
      {% for d in site.data.domains %}{% if d.slug == page.domain %}
      <div class="domain-card">
        <div class="domain-card-header">
          <div class="domain-icon">
            {% include domain-icon.html icon=d.icon %}
          </div>
          <h3>{{ d.he.title }}</h3>
        </div>
        <p class="domain-framing">{{ d.he.framing }}</p>
        <a href="{{ '/solutions/customers/' | relative_url }}" class="domain-card-link">לעמוד התחום ›</a>
      </div>
      {% endif %}{% endfor %}
      {% assign related = "agent-assist-onboarding,whatsapp-service-actions" | split: "," %}
      {% for slug in related %}
      {% assign rel = site.data.scenarios | where: "slug", slug | first %}
      {% include scenario-card.html scenario=rel %}
      {% endfor %}
    </div>

    <p class="mt-6"><a href="{{ '/how-we-work/' | relative_url }}" class="domain-card-link">איך עובדים ›</a></p>
  </div>
</section>
