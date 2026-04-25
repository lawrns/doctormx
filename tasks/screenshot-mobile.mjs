import { chromium } from 'playwright';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = resolve('/Users/lukatenbosch/Downloads/doctory/screenshots');
mkdirSync(OUT_DIR, { recursive: true });

async function loginAs(page, email, password) {
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  const ef = await page.$('input[type="email"]');
  if (!ef) return false;
  await ef.fill(email);
  const pf = await page.$('input[type="password"]');
  if (pf) await pf.fill(password);
  const btn = await page.$('button[type="submit"]');
  if (btn) await btn.click();
  await page.waitForTimeout(2000);
  return true;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Retry the failed patient page
  const fp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await loginAs(fp, 'patient@test.com', 'Test1234!');
    await fp.goto(`${BASE_URL}/app/ai-consulta`, { waitUntil: 'networkidle', timeout: 20000 });
    await fp.waitForTimeout(2000);
    await fp.screenshot({ path: resolve(OUT_DIR, 'app-ai-consulta.png'), fullPage: false });
    await fp.screenshot({ path: resolve(OUT_DIR, 'app-ai-consulta-full.png'), fullPage: true });
    console.log('✅ app/ai-consulta');
  } catch(e) {
    console.log('❌ app/ai-consulta:', e.message.substring(0, 80));
  }
  await fp.close();

  // Mobile screenshots
  const mobilePaths = [
    '/', '/pricing', '/for-doctors', '/app/referrals',
    '/auth/login', '/auth/register', '/alternativa-doctoralia',
    '/doctor/referrals', '/second-opinion', '/clinicas',
    '/ai-consulta', '/consulta-online', '/doctores-online',
    '/para-medicos', '/connect',
  ];
  for (const path of mobilePaths) {
    try {
      const mp = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const name = path.replace(/^\//, '').replace(/\//g, '-') || 'homepage';
      await mp.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 20000 });
      await mp.waitForTimeout(1500);
      await mp.screenshot({ path: resolve(OUT_DIR, `mobile-${name}.png`), fullPage: true });
      await mp.close();
      console.log(`📱 ${path} ✅`);
    } catch(e) {
      console.log(`📱 ${path} ❌ ${e.message.substring(0, 60)}`);
    }
  }

  await browser.close();
  console.log('\nDone — all mobile screenshots complete');
})();
