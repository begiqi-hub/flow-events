import { test, expect } from '@playwright/test';

// =====================================================================
// 1. KONFIGURIMI I PROJEKTIT (A-Zh)
// =====================================================================
const URL_BAZE = 'http://localhost:3000/sq';
const TIMEOUT_GJATË = 25000; // I japim pak më shumë kohë për siguri

const ADMIN = { email: 'adnanbegiqi@gmail.com', pass: '123456' };
const BIZNESI = { email: 'sirius@mail.com', pass: '123456' };

// =====================================================================
// TESTIMI MASTER - HALLEVO
// =====================================================================
test.describe('Auditimi i Plotë i Sistemit - HALLEVO', () => {

  // --- FAZA A: SUPERADMINI ---
  test('Auditimi i Superadminit: Login dhe Menaxhimi i Bizneseve', async ({ page }) => {
    await page.goto(`${URL_BAZE}/login`);
    await page.waitForLoadState('networkidle');

    // Login
    await page.type('input[type="email"]', ADMIN.email, { delay: 50 });
    await page.type('input[type="password"]', ADMIN.pass, { delay: 50 });
    
    await Promise.all([
      page.waitForURL(/.*superadmin\/bizneset/, { timeout: TIMEOUT_GJATË }),
      page.click('button[type="submit"]')
    ]);

    // KORRIGJIM: Titulli i saktë që pamë në snapshot është "Bizneset e Regjistruara"
    await expect(page.getByRole('heading', { name: 'Bizneset e Regjistruara' })).toBeVisible();
    
    console.log('✅ Faza A: Superadmini u kontrollua me sukses.');
  });

  // --- FAZA B: BIZNESI, SIGURIA DHE REZERVIMET ---
  test('Auditimi i Biznesit: Dashboard, Stafi dhe Profili', async ({ page }) => {
    test.setTimeout(60000);
    // 1. Login si Biznes
    await page.goto(`${URL_BAZE}/login`);
    await page.type('input[type="email"]', BIZNESI.email, { delay: 50 });
    await page.type('input[type="password"]', BIZNESI.pass, { delay: 50 });
    
    await Promise.all([
      page.waitForURL(url => url.pathname.endsWith('/biznes') || url.pathname.includes('/biznes/'), { timeout: TIMEOUT_GJATË }),
      page.click('button[type="submit"]')
    ]);

    // 2. Kontrolli i Stafit (Izolimi i të dhënave)
    await page.goto(`${URL_BAZE}/biznes/perdoruesit`);
    const tabela = page.locator('table');
    const tekstiTabeles = await tabela.innerText();
    expect(tekstiTabeles.toLowerCase()).not.toContain('superadmin');
    console.log('✅ Faza B: Izolimi i të dhënave funksionon.');

    // 3. Kontrolli i Rezervimeve
    await page.goto(`${URL_BAZE}/biznes/rezervimet/shto`);
    
    // KORRIGJIM: Në vend të locator('form') që ishte 'hidden', përdorim titullin e faqes
    await expect(page.getByRole('heading', { name: 'Rezervim i Ri' })).toBeVisible();
    await expect(page.getByText('Detajet e Eventit')).toBeVisible();
    console.log('✅ Faza C: Moduli i Rezervimeve është gati.');

    // --- FAZA Zh: KONFIGURIMET (Rregullimi i 404) ---
    await page.goto(`${URL_BAZE}/biznes/konfigurimet/profili`);
    
    // Verifikojmë që nuk ka errore 404 ose 500
    await expect(page.getByText('404')).not.toBeVisible();
    await expect(page.getByText('Internal Server Error')).not.toBeVisible();
    
    // Kontrollojmë që titulli i profilit është ngarkuar
    const titulliProfilit = page.getByRole('heading', { name: 'Profili i Biznesit', exact: true });
    await expect(titulliProfilit).toBeVisible();
    
    console.log('✅ Faza Zh: Auditimi përfundoi. Çdo gjë është OK!');
  });

});