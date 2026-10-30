---
layout: scenario
lang: he
scenario: documents-across-systems
domain: operations
title: "מסמך שנכנס מקדם את התהליך"
description: "טופס, חשבונית, בקשה או חוזה נקראים ונבדקים מול המערכות, והתהליך מתקדם. רק חריגים מגיעים לטיפול אדם."
---

<!-- 3. Work Today (Spec §3.4, סעיף 3) -->
<section class="section section-alt" id="work-today">
  <div class="container">
    <div class="section-header">
      <h2>העבודה היום</h2>
    </div>
    <p class="text-lead content-measure-70">
      TODO-COPY: העבודה היום בתהליכי מסמכים בין מערכות (§3.5 תרחיש S3)
    </p>
  </div>
</section>

<!-- 4. How It Works (Spec §3.4, סעיף 4) -->
<section class="section" id="how-it-works">
  <div class="container">
    <div class="section-header">
      <h2>איך זה עובד</h2>
    </div>
    <p class="todo-copy">TODO-COPY: שלבי הזרימה במסמכים ותהליכים בין מערכות (§3.5 תרחיש S3)</p>
  </div>
</section>

<!-- 5 & 7. Deliverables & Requirements (Spec §3.4, סעיפים 5, 7) -->
<section class="section section-alt" id="deliverables-and-requirements">
  <div class="container">
    <div class="deliverables-grid">
      <div>
        <div class="section-header">
          <h2>מה אפשר לקבל</h2>
        </div>
        <p class="todo-copy">TODO-COPY: תוצרים בתהליכי מסמכים בין מערכות (§3.5 תרחיש S3)</p>
      </div>

      <div>
        <div class="section-header">
          <h2>מה צריך מצדכם</h2>
        </div>
        <p class="todo-copy">TODO-COPY: מה צריך מצדכם בתהליכי מסמכים (§3.5 תרחיש S3)</p>
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
    <p class="todo-copy">TODO-COPY: התאמה לארגון בתהליכי מסמכים (§3.5 תרחיש S3)</p>
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
  <div class="container">
    <div class="section-header">
      <h2>שאלות נפוצות</h2>
    </div>
    <p class="todo-copy">TODO-COPY: שאלות ותשובות על מסמכים ותהליכים בין מערכות (§3.5 תרחיש S3)</p>
  </div>
</section>

<!-- 10 & 11. CTA & Next Steps (Spec §3.4, סעיפים 10-11) -->
{% include cta-band.html title="רוצים לבדוק איך זה ייראה אצלכם?" button="לשיחה על התרחיש הזה" from="scenario:documents-across-systems" %}

<section class="section" id="next-steps">
  <div class="container">
    <div class="section-header">
      <h2>המשך קריאה</h2>
    </div>
    <div class="entry-grid">
      <div class="domain-card">
        <h3>לתחום תפעול, מסמכים ומערכות</h3>
        <p>סקירה מלאה של כל הפתרונות והיכולות בתחום.</p>
        <a href="{{ '/solutions/operations/' | relative_url }}" class="domain-card-link">לעמוד התחום ›</a>
      </div>
      <div class="domain-card">
        <h3>איך עובדים איתנו</h3>
        <p>מסלול העבודה, שיתוף הפעולה, והבקרה על המערכות.</p>
        <a href="{{ '/how-we-work/' | relative_url }}" class="domain-card-link">איך עובדים ומי אנחנו ›</a>
      </div>
    </div>
  </div>
</section>
