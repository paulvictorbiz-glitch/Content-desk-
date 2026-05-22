const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const ROOT = __dirname;

// POST /api/generate-caption — fills an empty planner cell via the Anthropic
// API. Needs ANTHROPIC_API_KEY in the server environment.
function generateCaption(req, res) {
  let body = '';
  req.on('data', (d) => { body += d; });
  req.on('end', () => {
    const reply = (obj) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
    let payload;
    try { payload = JSON.parse(body || '{}'); } catch (e) { payload = {}; }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      reply({ ok: false, error: 'Set ANTHROPIC_API_KEY in the server environment to enable caption generation.' });
      return;
    }
    const kind = payload.kind || 'video-text';
    const title = String(payload.title || '').slice(0, 200);
    const samples = (Array.isArray(payload.samples) ? payload.samples : [])
      .slice(0, 6).map((s) => String(s).slice(0, 600));
    const what = kind === 'pic-description' ? 'a reflective description for a social-media picture post'
      : kind === 'pic-quote' ? 'a short evocative quote for a social-media picture post'
      : `a social-media caption for a video titled "${title}"`;
    const styleBlock = samples.length
      ? 'Match the length, tone and rhythm of these existing ones:\n\n' + samples.map((s, i) => `${i + 1}. ${s}`).join('\n\n')
      : 'Keep it to 2-4 short, punchy sentences.';
    const prompt = `Write ${what}. ${styleBlock}\n\nReply with only the text itself — no preamble, no surrounding quotes.`;

    const apiBody = JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });
    const apiReq = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-length': Buffer.byteLength(apiBody),
      },
    }, (apiRes) => {
      let data = '';
      apiRes.on('data', (d) => { data += d; });
      apiRes.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.content && j.content[0] && j.content[0].text) reply({ ok: true, text: j.content[0].text.trim() });
          else reply({ ok: false, error: (j.error && j.error.message) || 'Unexpected API response' });
        } catch (e) { reply({ ok: false, error: 'Could not parse the API response' }); }
      });
    });
    apiReq.on('error', (e) => reply({ ok: false, error: 'API request failed: ' + e.message }));
    apiReq.write(apiBody);
    apiReq.end();
  });
}

// Runs a drive-sync/*.py script and replies with JSON { ok, count, summary }.
function runSync(res, scriptRelPath, countRegex) {
  const py = spawn('python', [path.join(ROOT, scriptRelPath)], { cwd: ROOT });
  let out = '', err = '', done = false;
  const reply = (status, body) => {
    if (done) return;
    done = true;
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
  py.stdout.on('data', (d) => { out += d; });
  py.stderr.on('data', (d) => { err += d; });
  py.on('error', (e) => reply(500, { ok: false, error: 'Could not start Python: ' + e.message }));
  py.on('close', (code) => {
    if (code === 0) {
      const m = out.match(countRegex);
      reply(200, { ok: true, count: m ? Number(m[1]) : null, summary: out });
    } else {
      reply(200, { ok: false, error: (err || out || 'exit code ' + code).slice(-600) });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/scan-drive' && req.method === 'POST') {
    runSync(res, 'drive-sync/sync.py', /Assets found\s*:\s*(\d+)/);
    return;
  }
  if (req.url === '/api/sync-sheet' && req.method === 'POST') {
    runSync(res, 'drive-sync/sheet-sync.py', /Planner rows\s*:\s*(\d+)/);
    return;
  }
  if (req.url === '/api/generate-caption' && req.method === 'POST') {
    generateCaption(req, res);
    return;
  }

  // Default to index.html for SPA routing
  let filePath = path.join(ROOT, req.url === '/' ? 'Nikky Content Desk.html' : req.url);

  // Security: prevent directory traversal
  if (!path.resolve(filePath).startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Try to read the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found and it's not a static asset, serve index.html (SPA fallback)
      if (req.url !== '/' && !path.extname(req.url)) {
        fs.readFile(path.join(ROOT, 'Nikky Content Desk.html'), (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found\n' + err.message);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript',
      '.jsx': 'application/javascript',
      '.json': 'application/json',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ██████╗ ██████╗ ███╗   ██╗████████╗███████╗███╗   ██╗████████╗');
  console.log('  ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝████╗  ██║╚══██╔══╝');
  console.log('  ██║     ██║   ██║██╔██╗ ██║   ██║   █████╗  ██╔██╗ ██║   ██║');
  console.log('  ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██║╚██╗██║   ██║');
  console.log('  ╚██████╗╚██████╔╝██║ ╚████║   ██║   ███████╗██║ ╚████║   ██║');
  console.log('   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝');
  console.log('                           DESK');
  console.log('');
  console.log(`  Server running at http://localhost:${PORT}`);
  console.log('  Press Ctrl+C to stop');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('   Try closing the other Content Desk window or using a different port.');
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});
