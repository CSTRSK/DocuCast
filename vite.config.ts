import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    // Wichtig fuer den Betrieb in einem Unterordner (cstrsk.de/DocuCast/):
    // alle Asset-Pfade relativ, damit nichts auf die Domain-Wurzel zeigt.
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          // Auch die Manifest-Pfade bleiben im Unterordner - scope './' haelt den
          // Service Worker auf /DocuCast/ beschraenkt und greift nicht auf die ganze Domain.
          id: './',
          name: 'DocuCast - Dokumente zu Audio-Podcasts',
          short_name: 'DocuCast',
          description: 'Dokumente (PDF, Word) clientseitig in Zwei-Sprecher-Audiopodcasts umwandeln - ohne Upload, ohne Konto, offline nutzbar.',
          lang: 'de',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          start_url: './',
          scope: './',
          icons: [
            {src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
            {src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
            {src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,wasm,mjs}'],
          // Die Laufzeit-Dateien der Sprachausgabe (ONNX/Phonemizer, ~29 MB) werden
          // nicht vorab in den Cache gelegt - sie kommen on demand ueber den Browser-Cache.
          globIgnores: ['**/voices-runtime/**'],
          // pdf.js bringt einen grossen Worker mit - der gehoert in den Cache, damit
          // die App nach dem ersten Besuch auch offline Dokumente lesen kann.
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
