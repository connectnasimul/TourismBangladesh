const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  try {
    const urlPath = req.url.split('?')[0];
    let safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[\/\\])+/, '');
    
    if (safePath === '/' || safePath === '\\') {
      safePath = '/index.html';
    }

    let filePath = path.join(ROOT, safePath);

    // Check if file exists, or if appending .html matches
    if (!fs.existsSync(filePath)) {
      if (fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
        return;
      }
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Support HTTP 206 Partial Content for video streaming
    if (ext === '.mp4') {
      const range = req.headers.range;
      const fileSize = stat.size;

      if (range) {
        const rangeMatch = range.match(/bytes=(\d*)-(\d*)/);
        let start = (rangeMatch && rangeMatch[1]) ? parseInt(rangeMatch[1], 10) : 0;
        let end = (rangeMatch && rangeMatch[2]) ? parseInt(rangeMatch[2], 10) : fileSize - 1;

        if (isNaN(start)) start = 0;
        if (isNaN(end) || end >= fileSize) end = fileSize - 1;
        if (start > end || start >= fileSize) {
          res.writeHead(416, {
            'Content-Range': `bytes */${fileSize}`
          });
          res.end();
          return;
        }

        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType
        });
        file.pipe(res);
        return;
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Accept-Ranges': 'bytes',
          'Content-Type': contentType
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error('Request error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('500 Internal Server Error');
    }
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught server exception:', err);
});

server.listen(PORT, () => {
  console.log(`Beautiful Bangladesh server running at http://localhost:${PORT}/`);
});
