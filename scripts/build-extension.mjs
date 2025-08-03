import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Dynamic import for Vite to handle devDependency
const { build } = await import('vite');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

async function buildExtension() {
  console.log('Building Chrome extension...');

  // Build popup with Vite
  await build({
    root: projectRoot,
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      lib: {
        entry: path.resolve(projectRoot, 'src/popup.tsx'),
        name: 'popup',
        fileName: 'popup',
        formats: ['iife']
      },
      rollupOptions: {
        output: {
          entryFileNames: 'popup.js',
          extend: true
        }
      }
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  // Copy static files
  const publicDir = path.join(projectRoot, 'public');
  const distDir = path.join(projectRoot, 'dist');

  await fs.copy(path.join(publicDir, 'manifest.json'), path.join(distDir, 'manifest.json'));
  await fs.copy(path.join(publicDir, 'popup.html'), path.join(distDir, 'popup.html'));
  await fs.copy(path.join(publicDir, 'brandList.json'), path.join(distDir, 'brandList.json'));
  await fs.copy(path.join(publicDir, 'content-script.js'), path.join(distDir, 'content-script.js'));
  await fs.copy(path.join(publicDir, 'content-styles.css'), path.join(distDir, 'content-styles.css'));

  console.log('✅ Extension built successfully in dist/ folder');
  console.log('📦 To install: Go to chrome://extensions/, enable Developer mode, and click "Load unpacked" to select the dist folder');
}

buildExtension().catch(console.error);