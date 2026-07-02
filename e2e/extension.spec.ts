import { test, expect, chromium, type BrowserContext, type Worker } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const LEVELS = ['safe', 'suspicious', 'dangerous'] as const;
const SIZES = [16, 32, 48, 128] as const;

let context: BrowserContext;
let worker: Worker;

test.beforeAll(async () => {
  context = await chromium.launchPersistentContext('', {
    headless: false, // las extensiones no cargan en headless
    args: [`--disable-extensions-except=${DIST}`, `--load-extension=${DIST}`],
  });
  worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
});

test.afterAll(async () => {
  await context?.close();
});

test('la extensión registra su service worker', () => {
  expect(worker.url()).toMatch(/^chrome-extension:\/\/[a-p]{32}\//);
});

test('los 12 iconos de estado están empaquetados y son accesibles', async () => {
  // el bug: los iconos de estado no llegaban a dist/
  const statuses = await worker.evaluate(
    async ({ levels, sizes }) => {
      const out: Record<string, number> = {};
      for (const level of levels) {
        for (const size of sizes) {
          const url = chrome.runtime.getURL(`icons/state-${level}-${size}.png`);
          out[`${level}-${size}`] = (await fetch(url)).status;
        }
      }
      return out;
    },
    { levels: LEVELS, sizes: SIZES },
  );

  for (const [key, status] of Object.entries(statuses)) {
    expect(status, `icons/state-${key}.png`).toBe(200);
  }
});

test('chrome.action.setIcon con las rutas de estado no falla', async () => {
  const ok = await worker.evaluate(async () => {
    try {
      await chrome.action.setIcon({
        path: {
          16: 'icons/state-dangerous-16.png',
          32: 'icons/state-dangerous-32.png',
          48: 'icons/state-dangerous-48.png',
          128: 'icons/state-dangerous-128.png',
        },
      });
      return true;
    } catch {
      return false;
    }
  });
  expect(ok).toBe(true);
});
