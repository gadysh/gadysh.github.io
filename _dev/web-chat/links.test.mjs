import test from 'node:test';
import assert from 'node:assert/strict';
import { messageParts, appendMessage } from '../../assets/js/web-chat-links.mjs';

const base = 'https://poworg.com/solutions/customers/';
test('Hebrew Markdown and bare URLs preserve labels, order and punctuation', () => {
  assert.deepEqual(messageParts('כאן: [מסמכים](/scenarios/documents-across-systems/)\nוגם https://poworg.com/solutions/knowledge-and-teams/.', base), [
    { text: 'כאן: ' }, { text: 'מסמכים', href: 'https://poworg.com/scenarios/documents-across-systems/' },
    { text: '\nוגם ' }, { text: 'https://poworg.com/solutions/knowledge-and-teams/', href: 'https://poworg.com/solutions/knowledge-and-teams/' }, { text: '.' },
  ]);
});
test('balanced URL parentheses and surrounding punctuation stay intact', () => {
  const parts = messageParts('[דוגמה](https://example.com/a_(b)) (https://example.com/a_(b)).', base);
  assert.deepEqual(parts.filter(part => part.href).map(part => part.href), ['https://example.com/a_(b)', 'https://example.com/a_(b)']);
  assert.equal(parts.at(-1).text, ').');
});
test('unsafe schemes stay text; HTTP, relative paths and anchors remain usable', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'vbscript:msgbox(1)', 'file:///etc/passwd']) {
    const message = `[לחץ](${url})`;
    assert.deepEqual(messageParts(message, base), [{ text: message }]);
  }
  for (const url of ['http://example.com/', '../operations/', '#details']) {
    assert.equal(messageParts(`[פתח](${url})`, base)[0].href, new URL(url, base).href);
  }
});
test('renderer creates only literal text and same-tab anchors, including hostile model output', t => {
  const original = globalThis.document;
  const nodes = [];
  globalThis.document = {
    createTextNode: text => ({ textContent: text }),
    createElement: tag => ({ tag }),
  };
  t.after(() => { if (original) globalThis.document = original; else delete globalThis.document; });
  appendMessage({ append: node => nodes.push(node) }, '<img src=x onerror=alert(1)> [<svg onload=alert(1)>](/contact/)', base);
  assert.equal(nodes[0].textContent, '<img src=x onerror=alert(1)> ');
  assert.deepEqual(nodes[1], { tag: 'a', textContent: '<svg onload=alert(1)>', href: 'https://poworg.com/contact/', target: '_self', dir: 'auto' });
});
