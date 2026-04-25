import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = resolve('/Users/lukatenbosch/Downloads/doctory/screenshots');

const PAGES = [
  { path: '/', name: 'homepage', desc: 'Landing page' },
  { path: '/pricing', name: 'pricing', desc: 'Pricing page (overhauled)' },
  { path: '/for-doctors', name: 'for-doctors', desc: 'Doctor landing page (overhauled)' },
  { path: '/doctor/referrals', name: 'doctor-referrals', desc: 'Doctor referral dashboard' },
  { path: '/doctor/referrals/leaderboard', name: 'doctor-referrals-leaderboard', desc: 'Referral leaderboard' },
  { path: '/app/referrals', name: 'app-referrals', desc: 'Patient referral page' },
  { path: '/app/suscripcion', name: 'app-suscripcion', desc: 'Patient subscription' },
  { path: '/app/historial', name: 'app-historial', desc: 'Health records/history' },
  { path: '/app/second-opinion', name: 'app-second-opinion', desc: 'Second opinion patient' },
  { path: '/second-opinion', name: 'second-opinion-landing', desc: 'Second opinion landing' },
  { path: '/alternativa-doctoralia', name: 'alternativa-doctoralia', desc: 'Doctoralia alternative SEO' },
  { path: '/para-medicos', name: 'para-medicos', desc: 'Para medicos resource hub' },
  { path: '/connect', name: 'connect', desc: 'Connect page (enhanced)' },
  { path: '/app/premium', name: 'app-premium', desc: 'Premium features' },
  { path: '/admin/outbound', name: 'admin-outbound', desc: 'WhatsApp outbound dashboard' },
  { path: '/admin/churn', name: 'admin-churn', desc: 'Churn prevention dashboard' },
  { path: '/admin/analytics', name: 'admin-analytics', desc: 'Admin analytics' },
  { path: '/admin/pharmacy', name: 'admin-pharmacy', desc: 'Pharmacy admin' },
  { path: '/admin/premium', name: 'admin-premium', desc: 'Premium admin' },
  { path: '/admin/doctors', name: 'admin-doctors', desc: 'Doctors admin' },
  { path: '/auth/login', name: 'auth-login', desc: 'Login page' },
  { path: '/auth/register', name: 'auth-register', desc: 'Register page' },
  { path: '/auth/complete-profile', name: 'auth-complete-profile', desc: 'Complete profile' },
  { path: '/clinicas', name: 'clinicas', desc: 'Clinicas directory' },
  { path: '/ai-consulta', name: 'ai-consulta', desc: 'AI consulta page' },
  { path: '/blog', name: 'blog', desc: 'Blog' },
  { path: '/faq', name: 'faq', desc: 'FAQ' },
  { path: '/consulta-online', name: 'consulta-online', desc: 'Online consultation' },
  { path: '/doctores-online', name: 'doctores-online', desc: 'Online doctors' },
  { path: '/contact', name: 'contact', desc: 'Contact page' },
  { path: '/about', name: 'about', desc: 'About page' },
  { path: '/privacy', name: 'privacy', desc: 'Privacy page' },
  { path: '/terms', name: 'terms', desc: 'Terms page' },
  { path: '/doctor', name: 'doctor-dashboard', desc: 'Doctor dashboard' },
  { path: '/doctor/appointments', name: 'doctor-appointments', desc: 'Doctor appointments' },
  { path: '/doctor/analytics', name: 'doctor-analytics', desc: 'Doctor analytics' },
  { path: '/doctor/finances', name: 'doctor-finances', desc: 'Doctor finances' },
  { path: '/doctor/availability', name: 'doctor-availability', desc: 'Doctor availability' },
  { path: '/doctor/onboarding', name: 'doctor-onboarding', desc: 'Doctor onboarding' },
  { path: '/app', name: 'app-dashboard', desc: 'Patient dashboard' },
  { path: '/app/appointments', name: 'app-appointments', desc: 'Patient appointments' },
  { path: '/app/chat', name: 'app-chat', desc: 'Patient chat' },
  { path: '/app/ai-consulta', name: 'app-ai-consulta', desc: 'Patient AI consulta' },
];

const AUTH_USERS = {
  patient: { email: 'patient@test.com', password: 'Test1234!' },
  doctor: { email: 'doctor@test.com', password: 'Test1234!' },
  admin: { email: 'admin@test.com', password: 'Test1234!' },
};

// Role mapping for each page
const PAGE_ROLES = {
  'doctor-referrals': 'doctor',
  'doctor-referrals-leaderboard': 'doctor',
  'app-referrals': 'patient',
  'app-suscripcion': 'patient',
  'app-historial': 'patient',
  'app-second-opinion': 'patient',
  'app-premium': 'patient',
  'admin-outbound': 'admin',
  'admin-churn': 'admin',
  'admin-analytics': 'admin',
  'admin-pharmacy': 'admin',
  'admin-premium': 'admin',
  'admin-doctors': 'admin',
  'doctor-dashboard': 'doctor',
  'doctor-appointments': 'doctor',
  'doctor-analytics': 'doctor',
  'doctor-finances': 'doctor',
  'doctor-availability': 'doctor',
  'doctor-onboarding': 'doctor',
  'app-dashboard': 'patient',
  'app-appointments': 'patient',
  'app-chat': 'patient',
  'app-ai-consulta': 'patient',
};

async function loginAndScreenshot(browser, pageConfig, pageName) {
  const role = PAGE_ROLES[pageName];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    if (role) {
      const creds = AUTH_USERS[role];
      // Navigate to login first
      await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);

      // Try to fill login
      const emailField = await page.$('input[type="email"]');
      if (emailField) {
        await emailField.fill(creds.email);
        const passField = await page.$('input[type="password"]');
        if (passField) await passField.fill(creds.password);
        const btn = await page.$('button[type="submit"]');
        if (btn) {
          await btn.click();
          await page.waitForTimeout(2000);
        }
      }

      // Now navigate to target page
      await page.goto(`${BASE_URL}${pageConfig.path}`, { waitUntil: 'networkidle', timeout: 20000 });
    } else {
      await page.goto(`${BASE_URL}${pageConfig.path}`, { waitUntil: 'networkidle', timeout: 20000 });
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: resolve(OUT_DIR, `${pageName}.png`), fullPage: false });
    await page.screenshot({ path: resolve(OUT_DIR, `${pageName}-full.png`), fullPage: true });
    await page.close();
    return true;
  } catch (e) {
    console.log(`  ❌ ${e.message.substring(0, 120)}`);
    try {
      await page.screenshot({ path: resolve(OUT_DIR, `${pageName}-error.png`) });
    } catch {}
    await page.close().catch(() => {});
    return false;
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const p of PAGES) {
    const name = p.name;
    process.stdout.write(`\n📸 ${p.path} — ${p.desc}... `);
    const ok = await loginAndScreenshot(browser, p, name);
    console.log(ok ? '✅' : '❌');
    results.push({ path: p.path, name, status: ok ? '✅' : '❌', desc: p.desc, role: PAGE_ROLES[name] || 'public' });
  }

  // Mobile screenshots
  console.log('\n📱 MOBILE SCREENSHOTS');
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
      console.log(`  📱 ${path} ✅`);
    } catch (e) {
      console.log(`  📱 ${path} ❌`);
    }
  }

  await browser.close();

  // Summary
  const total = results.length;
  const passed = results.filter(r => r.status === '✅').length;
  writeFileSync(resolve(OUT_DIR, 'SUMMARY.md'),
    `# Screenshot Summary\n\n${results.map(r => `| ${r.status} | \`${r.path}\` | \`${r.name}.png\` | ${r.role} | ${r.desc} |`).join('\n')}\n\n**${passed}/${total} pages captured**\n`);
  console.log(`\n📁 ${OUT_DIR}`);
  console.log(`📊 ${passed}/${total} pages captured`);
}

main().catch(console.error);
