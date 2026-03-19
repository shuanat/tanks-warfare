import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

/**
 * Файл из `public/` (например `public/assets/...`) — отдаёт Vite; иначе — прокси на Node.
 * Так в dev не нужен сервер для статики, если ассеты скопированы в `client/public/assets/`.
 * Если папка пустая — по-прежнему нужен `npm run dev:server` (или `npm run dev`).
 */
function publicFileForAssetUrl(url) {
  if (!url || !url.startsWith('/assets')) return null;
  const pathname = url.split('?')[0];
  const publicRoot = path.resolve(__dirname, 'public');
  const candidate = path.resolve(publicRoot, pathname.slice(1));
  if (!candidate.startsWith(publicRoot)) return null;
  try {
    if (fs.statSync(candidate).isFile()) return pathname;
  } catch {
    /* нет файла — пойдём на прокси */
  }
  return null;
}

/**
 * В dev ассеты с `/assets/*` проксируются на Node, если их нет в `public/`
 * (часто PNG/MP3 только на сервере в STATIC_ROOT / после build).
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, '');
  const backendPort = env.PORT || '3033';

  return {
    root: __dirname,
    publicDir: 'public',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/assets': {
          target: `http://127.0.0.1:${backendPort}`,
          changeOrigin: true,
          bypass(req) {
            return publicFileForAssetUrl(req.url ?? '') ?? undefined;
          },
        },
      },
    },
  };
});
