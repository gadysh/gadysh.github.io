/**
 * מנגנון טעינת תוכן Markdown
 * טוען קבצי MD, ממיר ל-HTML ומזריק לעמוד
 */

// טעינת קובץ Markdown בודד
export async function loadMarkdown(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    const markdown = await response.text();
    return marked.parse(markdown);
  } catch (error) {
    console.error('Error loading markdown:', error);
    return `<p class="error-message">שגיאה בטעינת התוכן. נסה לרענן את הדף.</p>`;
  }
}

// טעינת תוכן לאלמנט ספציפי
export async function loadContentToElement(path, elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element ${elementId} not found`);
    return;
  }
  
  element.innerHTML = '<div class="loading">טוען...</div>';
  const html = await loadMarkdown(path);
  element.innerHTML = html;
}

// פרסור תוכן Markdown למבנה מאורגן
export function parseMarkdownSections(markdown) {
  const lines = markdown.split('\n');
  const sections = {};
  let currentSection = null;
  let currentContent = [];

  lines.forEach(line => {
    // זיהוי כותרת (## Section Name)
    const headerMatch = line.match(/^##\s+(.+)/);
    if (headerMatch) {
      // שמירת סקשן קודם
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      // התחלת סקשן חדש
      currentSection = headerMatch[1].trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  });

  // שמירת סקשן אחרון
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

// טעינת כל מקרי השימוש מתיקייה
export async function loadUseCases() {
  const useCases = [];
  
  // רשימת קבצים (נוסיף יותר אם צריך)
  const files = [
    '001-customer-service.md',
    '002-legal-docs.md',
    '003-hr-automation.md',
    '004-voice-support.md',
    '005-sales-analysis.md',
    '006-knowledge-management.md',
    '007-procurement.md',
    '008-quality-control.md'
  ];

  for (const file of files) {
    try {
      const response = await fetch(`/content/usecases/${file}`);
      if (!response.ok) continue;
      
      const markdown = await response.text();
      const lines = markdown.split('\n');
      
      // חילוץ מטא-דאטה מה-Markdown
      let title = '';
      let oneLiner = '';
      let icon = '🤖';
      let tags = [];
      let content = markdown;

      // פרסור פשוט של המבנה
      const titleMatch = markdown.match(/^#\s+(.+)/m);
      if (titleMatch) title = titleMatch[1];

      const oneLinerMatch = markdown.match(/^>\s*(.+)/m);
      if (oneLinerMatch) oneLiner = oneLinerMatch[1];

      const iconMatch = markdown.match(/<!--\s*icon:\s*(.+?)\s*-->/);
      if (iconMatch) icon = iconMatch[1];

      const tagsMatch = markdown.match(/<!--\s*tags:\s*(.+?)\s*-->/);
      if (tagsMatch) tags = tagsMatch[1].split(',').map(t => t.trim());

      useCases.push({
        id: file.replace('.md', ''),
        title,
        oneLiner,
        icon,
        tags,
        content,
        file
      });
    } catch (error) {
      console.error(`Error loading use case ${file}:`, error);
    }
  }

  return useCases;
}

// טעינת תוכן עמוד הבית והזרקה לסקשנים
export async function loadHomeContent() {
  try {
    const response = await fetch('/content/home.md');
    if (!response.ok) throw new Error('Failed to load home content');
    
    const markdown = await response.text();
    const sections = parseMarkdownSections(markdown);

    // הזרקה לכל סקשן
    Object.keys(sections).forEach(sectionName => {
      const content = sections[sectionName];
      const html = marked.parse(content);
      
      // מיפוי שמות סקשנים לאלמנטים
      const elementMap = {
        'Hero': 'hero-content',
        'Outcomes': 'outcomes-content',
        'Process': 'process-content',
        'Capabilities': 'capabilities-content',
        'Why PowOrg': 'why-content',
        'CTA': 'cta-content'
      };

      const elementId = elementMap[sectionName];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.innerHTML = html;
        }
      }
    });

  } catch (error) {
    console.error('Error loading home content:', error);
  }
}
