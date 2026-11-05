// A small link-only Markdown renderer. Model output never becomes HTML.
export function messageParts(message, baseURL) {
  const parts = [];
  const pattern = /\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)|(https?:\/\/[^\s<>]+)/giu;
  let offset = 0;
  for (const match of message.matchAll(pattern)) {
    if (match.index > offset) parts.push({ text: message.slice(offset, match.index) });
    let rawURL = match[2] || match[3];
    let suffix = '';
    if (match[3]) {
      while (/[.,!?;:\]\}،؛]$/u.test(rawURL) ||
        (rawURL.endsWith(')') && rawURL.split(')').length > rawURL.split('(').length)) {
        suffix = rawURL.slice(-1) + suffix;
        rawURL = rawURL.slice(0, -1);
      }
    }
    let href;
    try {
      const url = new URL(rawURL, baseURL);
      if (['https:', 'http:'].includes(url.protocol)) href = url.href;
    } catch { /* Keep malformed links readable as plain text. */ }
    if (href) {
      parts.push({ text: match[1] || rawURL, href });
      if (suffix) parts.push({ text: suffix });
    } else parts.push({ text: match[0] });
    offset = match.index + match[0].length;
  }
  if (offset < message.length) parts.push({ text: message.slice(offset) });
  return parts;
}

export function appendMessage(body, message, baseURL) {
  for (const part of messageParts(message, baseURL)) {
    if (!part.href) { body.append(document.createTextNode(part.text)); continue; }
    const link = document.createElement('a');
    link.textContent = part.text;
    link.href = part.href;
    link.target = '_self';
    link.dir = 'auto';
    body.append(link);
  }
}
