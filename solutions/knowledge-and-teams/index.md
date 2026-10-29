---
layout: domain
lang: he
domain: knowledge-and-teams
title: "ידע ועובדים | תחומי פתרון | PowOrg"
description: "הידע של הארגון זמין לכל עובד, בזמן שהוא צריך אותו."
---

{% for d in site.data.domains %}
  {% if d.slug == page.domain %}
    {% assign current_domain = d %}
  {% endif %}
{% endfor %}

<!-- 2. The Work We Can Change (Spec §3.3, סעיף 2) -->
<section class="section section-alt" id="work-types">
  <div class="container">
    <div class="section-header">
      <h2>העבודה שאפשר לשנות</h2>
    </div>

    <div class="fit-grid">
      {% for type in current_domain.he.work_types %}
        <div class="fit-item">
          <span class="fit-icon" aria-hidden="true">✓</span>
          <div>{{ type }}</div>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

<!-- 3. Scenarios in Domain (Spec §3.3, סעיף 3) -->
<section class="section" id="scenarios-in-domain">
  <div class="container">
    <div class="section-header">
      <h2>תרחישים בתחום</h2>
    </div>

    <div class="scenarios-grid">
      {% for s_slug in current_domain.scenarios %}
        {% for scenario in site.data.scenarios %}
          {% if scenario.slug == s_slug and scenario.published == true %}
            {% include scenario-card.html scenario=scenario %}
          {% endif %}
        {% endfor %}
      {% endfor %}
    </div>
  </div>
</section>

<!-- 4. Systems and Channels (Spec §3.3, סעיף 4) -->
<section class="section section-alt" id="systems">
  <div class="container">
    <div class="section-header">
      <h2>מערכות וערוצים</h2>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: var(--space-3);">
      {% for item in current_domain.he.systems_and_channels %}
        <span style="background: var(--surface); border: 1px solid var(--border); padding: 8px 16px; border-radius: 8px; font-weight: 500;">{{ item }}</span>
      {% endfor %}
    </div>
  </div>
</section>

<!-- 5. How It Is Adapted (Spec §3.3, סעיף 5) -->
<section class="section" id="adaptation">
  <div class="container">
    <div class="section-header">
      <h2>איך מתאימים לארגון שלכם</h2>
    </div>

    <div class="pillars-grid">
      <div class="pillar-card">
        <h3>על אילו פעולות מחליטים</h3>
        <p class="todo-copy">TODO-COPY: פירוט הרשאות ופעולות בידע ועובדים (§3.3 סעיף 5)</p>
      </div>

      <div class="pillar-card">
        <h3>מתי אדם נכנס לתהליך</h3>
        <p class="todo-copy">TODO-COPY: פירוט אישור פעולות רגישות ע״י אדם (§3.3 סעיף 5)</p>
      </div>

      <div class="pillar-card">
        <h3>איך מודדים שזה עובד</h3>
        <p class="todo-copy">TODO-COPY: פירוט מדדי זמינות ידע ואיכות תשובות (§3.3 סעיף 5)</p>
      </div>
    </div>
  </div>
</section>

<!-- 6. Didn't Find What You Were Looking For (Spec §3.3, סעיף 6) -->
<section class="section section-sand" id="not-found">
  <div class="container" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-6);">
    <div style="max-inline-size: 65ch;">
      <h2 style="margin-block-end: var(--space-2);">לא מצאתם את מה שחיפשתם?</h2>
      <p style="margin: 0; color: var(--muted); font-size: 1.05rem;">
        התרחישים כאן הם דוגמאות. ספרו לנו על העבודה בתחום, ונבדוק יחד.
      </p>
    </div>
    <a href="{{ '/contact/' | relative_url }}?from=domain:knowledge-and-teams" class="btn btn-primary">לשיחה על ידע ועובדים</a>
  </div>
</section>

<!-- 7. Other Domains (Spec §3.3, סעיף 7) -->
<section class="section" id="other-domains">
  <div class="container">
    <div class="section-header">
      <h2>תחומי פתרון נוספים</h2>
    </div>

    <div class="entry-grid">
      {% for domain in site.data.domains %}
        {% if domain.slug != page.domain and domain.published == true %}
          {% include domain-card.html domain=domain %}
        {% endif %}
      {% endfor %}
    </div>
  </div>
</section>
