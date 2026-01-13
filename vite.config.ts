import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Inject build timestamp at BUILD time - this gets baked into the bundle
  // and stays consistent until the next build/deployment
  define: {
    'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString()),
  },
  server: {
    host: "::",
    port: 8080,
    // Disable caching in development for faster updates
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Cache busting with content hashes
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // PWA is handled entirely by Progressier - no VitePWA plugin needed
    // This prevents service worker conflicts and ensures Progressier handles updates
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
