import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'Veladia',
  short_name: 'Veladia',
  version: pkg.version,
  description: pkg.description,
  minimum_chrome_version: '110',
  icons: { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
  },
  options_page: 'src/options/index.html',
  background: { service_worker: 'src/background/service-worker.ts', type: 'module' },
  content_scripts: [
    { matches: ['http://*/*', 'https://*/*'], js: ['src/content/content-script.ts'], run_at: 'document_idle' },
  ],
  permissions: ['storage', 'tabs'],
  host_permissions: ['http://*/*', 'https://*/*'],
});
