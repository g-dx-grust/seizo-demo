import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages はディレクトリ以外のパスを直接叩くと 404 を返すため、
// index.html と同内容の 404.html を置いて SPA ルーティングにフォールバックさせる。
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const index = resolve(__dirname, 'dist/index.html');
      if (existsSync(index)) copyFileSync(index, resolve(__dirname, 'dist/404.html'));
    },
  };
}

export default defineConfig(({ command }) => ({
  // プロジェクトページ配信のため build 時のみ /seizo-demo/ を基準にする
  base: command === 'build' ? '/seizo-demo/' : '/',
  plugins: [react(), tailwindcss(), spaFallback()],
  server: { port: 5173 },
}));
