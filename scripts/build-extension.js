import { build } from 'vite';
import fs from 'fs-extra';
import path from 'path';

async function buildExtension() {
  console.log('Building Chrome extension...');

  // Build popup with Vite
  await build({
    configFile: 'vite.config.extension.ts',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: path.resolve(__dirname, '../src/popup.tsx'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      }
    }
  });

  // Copy static files
  await fs.copy('public/manifest.json', 'dist/manifest.json');
  await fs.copy('public/popup.html', 'dist/popup.html');
  await fs.copy('public/brandList.json', 'dist/brandList.json');
  await fs.copy('public/content-script.js', 'dist/content-script.js');
  await fs.copy('public/content-styles.css', 'dist/content-styles.css');

  console.log('Extension built successfully in dist/ folder');
  console.log('To install: Go to chrome://extensions/, enable Developer mode, and click "Load unpacked" to select the dist folder');
}

buildExtension().catch(console.error);