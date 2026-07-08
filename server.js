const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const querystring = require('querystring');

const data = require('./lib/data');
const views = require('./lib/views');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

function serveStatic(req, res, pathname) {
  const filePath = path.join(PUBLIC_DIR, pathname.replace('/', ''));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    const type = ext === '.css' ? 'text/css' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // Static assets
    if (pathname === '/style.css') {
      return serveStatic(req, res, pathname);
    }

    // Home / search
    if (pathname === '/' && req.method === 'GET') {
      const q = url.searchParams.get('q') || '';
      const all = data.readAll();
      const results = data.search(q);
      return sendHtml(res, 200, views.homePage(q, results, all.length));
    }

    // Detail page
    if (pathname.startsWith('/medicine/') && req.method === 'GET') {
      const slug = decodeURIComponent(pathname.replace('/medicine/', ''));
      const entry = data.getBySlug(slug);
      if (!entry) return sendHtml(res, 404, views.notFoundPage());
      return sendHtml(res, 200, views.detailPage(entry));
    }

    // Add form
    if (pathname === '/add' && req.method === 'GET') {
      const flash = url.searchParams.get('saved') ? `Saved “${url.searchParams.get('saved')}” to the index.` : null;
      return sendHtml(res, 200, views.addPage(flash, null));
    }

    if (pathname === '/add' && req.method === 'POST') {
      const rawBody = await readBody(req);
      const fields = querystring.parse(rawBody);
      const required = ['name', 'treats', 'foods', 'ayurveda', 'caution'];
      const missing = required.filter(f => !fields[f] || !String(fields[f]).trim());
      if (missing.length) {
        return sendHtml(res, 400, views.addPage(null, `Please fill in: ${missing.join(', ')}.`));
      }
      const entry = data.addMedicine(fields);
      res.writeHead(302, { Location: `/add?saved=${encodeURIComponent(entry.name)}` });
      return res.end();
    }

    // About
    if (pathname === '/about' && req.method === 'GET') {
      return sendHtml(res, 200, views.aboutPage());
    }

    return sendHtml(res, 404, views.notFoundPage());
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
});

server.listen(PORT, () => {
  console.log(`The Alternate Pharmacopoeia running at http://localhost:${PORT}`);
});
