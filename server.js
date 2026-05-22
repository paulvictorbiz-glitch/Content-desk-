const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const server = http.createServer((req, res) => {
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
