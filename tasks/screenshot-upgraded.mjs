import { chromium } from 'playwright';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = resolve('/Users/lukatenbosch/Downloads/doctory/screenshots/upgraded');
mkdirSync(OUT, { recursive: true });

async function loginAs(browser, creds) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(BASE + '/auth/login', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1000);
    const ef = await page.$('input[type="email"]');
    if (ef) {
      await ef.fill(creds.email);
      const pf = await page.$('input[type="password"]');
      if (pf) await pf.fill(creds.password);
      const btn = await page.$('button[type="submit"]');
      if (btn) await btn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {}
  return page;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Admin pages
  const adminPage = await loginAs(browser, { email: 'admin@test.com', password: 'Test1234!' });
  const adminPaths = ['/admin', '/admin/analytics', '/admin/outbound', '/admin/churn', '/admin/pharmacy', '/admin/premium', '/admin/doctors'];
  for (const p of adminPaths) {
    try {
      await adminPage.goto(BASE + p, { waitUntil: 'networkidle', timeout: 15000 });
      await adminPage.waitForTimeout(1500);
      const name = p.replace(/^\//, '').replace(/\//g, '-') || 'admin';
      await adminPage.screenshot({ path: resolve(OUT, name + '.png'), fullPage: false });
      console.log('✅ admin', p);
    } catch (e) { console.log('❌ admin', p, e.message.substring(0, 50)); }
  }
  await adminPage.close();

  // Patient pages
  const patientPage = await loginAs(browser, { email: 'patient@test.com', password: 'Test1234!' });
  const patientPaths = ['/app', '/app/suscripcion', '/app/historial', '/app/second-opinion', '/app/premium', '/app/referrals'];
  for (const p of patientPaths) {
    try {
      await patientPage.goto(BASE + p, { waitUntil: 'networkidle', timeout: 15000 });
      await patientPage.waitForTimeout(1500);
      const name = p.replace(/^\//, '').replace(/\//g, '-');
      await patientPage.screenshot({ path: resolve(OUT, name + '.png'), fullPage: false });
      console.log('✅ patient', p);
    } catch (e) { console.log('❌ patient', p, e.message.substring(0, 50)); }
  }
  await patientPage.close();

  await browser.close();
  console.log('\nDone! ' + OUT);
})();
