import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom Vite plugin: makes the generated CSS non-render-blocking
// This allows the HTML skeleton to paint IMMEDIATELY (before CSS loads)
// drastically improving FCP. CSS still loads via preload+onload trick.
const deferMainCss = {
  name: 'defer-main-css',
  transformIndexHtml(html) {
    // Match Vite's generated stylesheet link (with or without crossorigin)
    return html.replace(
      /<link rel="stylesheet"([^>]*) href="(\/assets\/index[^"]+\.css)">/g,
      `<link rel="preload" href="$2" as="style" />\n  <link rel="stylesheet"$1 href="$2" media="print" onload="this.media='all';window.cssLoaded=true;if(window.onCssLoad)window.onCssLoad()" />\n  <noscript><link rel="stylesheet" href="$2"></noscript>`
    );
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), deferMainCss],
  server: {
    host: true,
    port: 5188,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
        }
      }
    }
  }
})
