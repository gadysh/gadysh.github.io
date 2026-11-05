// Loopback only. No proxy, credentials, model calls or production traffic.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function createMock({ root, port = 0, plan = [], delay = 80 } = {}) {
  const sessions = new Set();
  const busy = new Set();
  const requests = [];
  let sequence = 0;
  const server = createServer(async (req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    const json = (status, data, headers = {}) => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
      res.end(JSON.stringify(data));
    };
    const sid = /(?:^|;\s*)pow_web_sid=([^;]+)/.exec(req.headers.cookie || '')?.[1];
    if (path === '/api/external/web/session/reset' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      requests.push({ reset: true, body });
      if (body) return json(400, { error: 'invalid_request' });
      sessions.delete(sid);
      res.writeHead(204, { 'Set-Cookie': 'pow_web_sid=; HttpOnly; SameSite=Strict; Path=/api/external/web; Max-Age=0' });
      return res.end();
    }
    if (path === '/api/external/web/messages' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) { body += chunk; if (body.length > 8192) return json(413, { error: 'payload_too_large' }); }
      let data;
      try { data = JSON.parse(body); } catch { return json(400, { error: 'invalid_request' }); }
      if (Object.keys(data || {}).join() !== 'message' || typeof data.message !== 'string' || !data.message.trim() || data.message.length > 1000) return json(400, { error: 'invalid_request' });
      const token = req.headers['x-poworg-turnstile'];
      requests.push({ message: data.message, challenged: Boolean(token), session: Boolean(sid && sessions.has(sid)) });
      if (token && !token.includes('DUMMY') && !/^test-\d+$/.test(token)) return json(403, { error: 'challenge_failed' });
      if (!sessions.has(sid) && !token) return json(403, { error: 'challenge_required' });
      if (busy.has(sid)) return json(409, { error: 'busy' });
      const action = plan.shift();
      if (action?.expire) sessions.delete(sid);
      if (action?.status) return json(action.status, { error: action.error }, action.headers);
      const commands = {
        '[429]': [429, 'rate_limited'], '[409]': [409, 'busy'], '[503]': [503, 'unavailable'],
        '[404]': [404, 'not_found'], '[502]': [502, 'agent_error'], '[504]': [504, 'timeout'],
        '[limit]': [429, 'session_limit'], '[budget]': [429, 'budget_exhausted'],
        '[challenge]': [403, 'challenge_required'], '[invalid]': [403, 'challenge_failed'],
      };
      if (commands[data.message]) {
        const [code, error] = commands[data.message];
        await new Promise(resolve => setTimeout(resolve, delay));
        return json(code, { error }, { 'Retry-After': '3' });
      }
      const session = sessions.has(sid) ? sid : String(++sequence).padStart(43, '0');
      sessions.add(session);
      busy.add(session);
      await new Promise(resolve => setTimeout(resolve, action?.delay ?? delay));
      busy.delete(session);
      const linkExample = 'אפשר להתרשם כאן:\n[מסמכים ותהליכים בין מערכות](/scenarios/documents-across-systems/)\n[ניהול ידע וסיוע לעובדים](https://poworg.com/solutions/knowledge-and-teams/)\nוגם https://poworg.com/contact/';
      const outcome = action?.outcome || (['[blocked]', 'בדיקת חסימת תוכן'].includes(data.message) ? 'content_rejected' : null);
      json(200, { reply: action?.reply ?? (outcome === 'content_rejected' ? 'התוכן שנשלח נמצא לא תקין' : data.message === '[links]' ? linkExample : `תשובת דמה מקומית:\n${data.message}`), ...(outcome ? { outcome } : {}) }, {
        'Set-Cookie': `pow_web_sid=${session}; HttpOnly; SameSite=Strict; Path=/api/external/web`,
      });
      return;
    }
    if (path.startsWith('/api/')) return json(404, { error: 'not_found' });
    if (!root || !['GET', 'HEAD'].includes(req.method)) return json(404, { error: 'not_found' });
    try {
      const base = resolve(root);
      let file = resolve(base, '.' + decodeURIComponent(path));
      if (!file.startsWith(base + sep) && file !== base) return json(403, { error: 'forbidden' });
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.m4a': 'audio/mp4' };
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : await readFile(file));
    } catch { json(404, { error: 'not_found' }); }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return { origin: `http://127.0.0.1:${server.address().port}`, requests,
    close: () => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const mock = await createMock({ root: resolve('_site'), port: Number(process.env.WEB_CHAT_PORT || 4285), delay: 2000 });
  console.log(`LOCAL MOCK ONLY: ${mock.origin}/ (Cloudflare public test site key; no live backend)`);
}
