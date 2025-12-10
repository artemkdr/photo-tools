// @ts-nocheck
// Bun development server for Instagram Pano Cutter

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.ts': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const PORT = 3000;
const BASE_DIR = import.meta.dir;

function getExtension(path: string): string {
  const lastDot = path.lastIndexOf('.');
  return lastDot >= 0 ? path.slice(lastDot) : '';
}

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let pathname = url.pathname;
  
  // Default to index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Try to serve from public directory first
  let filePath = `${BASE_DIR}/public${pathname}`;
  let file = Bun.file(filePath);
  
  if (await file.exists()) {
    const ext = getExtension(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    return new Response(file, {
      headers: { 'Content-Type': mimeType },
    });
  }
  
  // Try src directory
  filePath = `${BASE_DIR}/src${pathname}`;
  file = Bun.file(filePath);
  
  if (await file.exists()) {
    const ext = getExtension(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    return new Response(file, {
      headers: { 'Content-Type': mimeType },
    });
  }
  
  // Handle .js requests by transpiling .ts files
  if (pathname.endsWith('.js')) {
    const tsPath = `${BASE_DIR}/src${pathname.replace('.js', '.ts')}`;
    const tsFile = Bun.file(tsPath);
    
    if (await tsFile.exists()) {
      const transpiler = new Bun.Transpiler({
        loader: 'ts',
      });
      const tsContent = await tsFile.text();
      const jsContent = transpiler.transformSync(tsContent);
      return new Response(jsContent, {
        headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
      });
    }
  }
  
  // 404
  return new Response('Not Found', { status: 404 });
}

console.log(`🚀 Instagram Pano Cutter running at http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: handleRequest,
};
