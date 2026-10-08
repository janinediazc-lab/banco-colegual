import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './server/backend-plugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, 'dist');
const PORT = process.env.PORT || 5173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer(async (req, res) => {
  try {
    // 1. Delegar llamadas API al backend central
    if (req.url && req.url.startsWith('/api/')) {
      const handled = await handleApiRequest(req, res);
      if (handled) return;
    }

    // 2. Servir archivos estáticos generados en dist/
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    let filePath = path.join(DIST_DIR, reqPath);

    // Seguridad: prevenir directory traversal
    if (!filePath.startsWith(DIST_DIR)) {
      res.statusCode = 403;
      res.end('Acceso denegado');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Fallback SPA (Single Page Application)
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    res.statusCode = 404;
    res.end('Archivo no encontrado');
  } catch (err) {
    console.error('[Server Error]', err);
    res.statusCode = 500;
    res.end('Error interno del servidor');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Web Banco Colegual activo en el puerto ${PORT}`);
  console.log(`🌐 Listo para producción local o en la nube (Render / Railway / VPS)`);
});
