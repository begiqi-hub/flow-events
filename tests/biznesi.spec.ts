import { test, expect } from '@playwright/test';

// =====================================================================
// 1. KONFIGURIMI I PROJEKTIT (A-Zh)
// =====================================================================
const URL_BAZE = 'http://localhost:3000/sq';
const TIMEOUT_GJATË = 25000; 

const ADMIN = { email: 'adnanbegiqi@gmail.com', pass: '123456' };
const BIZNESI = { email: 'sirius@mail.com', pass: '123456' };

test.describe('Auditimi i Plotë i Sistemit - HALLEVO', () => {

  // --- FAZA A: SUPERADMINI ---
  test('Auditimi i Superadminit: Login dhe Menaxhimi i Bizneseve', async ({ page }) => {
    // FIX: Rritim kohën maksimale të testit në 60 sekonda për të shmangur dështimet në Localhost
    test.setTimeout(60000);

    await page.goto(`${URL_BAZE}/login`);
    await page.waitForLoadState('networkidle');

    await page.type('input[type="email"]', ADMIN.email, { delay: 50 });
    await page.type('input[type="password"]', ADMIN.pass, { delay: 50 });
    
    await Promise.all([
      page.waitForURL(/.*superadmin\/bizneset/, { timeout: TIMEOUT_GJATË }),
      page.click('button[type="submit"]')
    ]);

    await expect(page.getByRole('heading', { name: 'Bizneset e Regjistruara' })).toBeVisible();
    console.log('✅ Faza A: Superadmini u kontrollua me sukses.');
  });

  // --- FAZA B: BIZNESI & SIGURIA ---
  test('Auditimi i Biznesit: Dashboard, Stafi dhe Profili', async ({ page }) => {
    // FIX: Rritim kohën maksimale edhe këtu në 60 sekonda
    test.setTimeout(60000);

    // 1. Login si Biznes
    await page.goto(`${URL_BAZE}/login`);
    await page.type('input[type="email"]', BIZNESI.email, { delay: 50 });
    await page.type('input[type="password"]', BIZNESI.pass, { delay: 50 });
    
    await Promise.all([
      page.waitForURL(url => url.pathname.endsWith('/biznes') || url.pathname.includes('/biznes/'), { timeout: TIMEOUT_GJATË }),
      page.click('button[type="submit"]')
    ]);

    // 2. Kontrolli i Izolimit të Stafit
    await page.goto(`${URL_BAZE}/biznes/perdoruesit`);
    const tabela = page.locator('table');
    const tekstiTabeles = await tabela.innerText();
    expect(tekstiTabeles.toLowerCase()).not.toContain('superadmin');
    console.log('✅ Faza B: Izolimi i të dhënave (Staff) funksionon.');

    // 3. Kontrolli i Rezervimeve
    await page.goto(`${URL_BAZE}/biznes/rezervimet/shto`);
    await expect(page.getByRole('heading', { name: 'Rezervim i Ri' })).toBeVisible();
    console.log('✅ Faza C: Moduli i Rezervimeve është gati.');

    // --- FAZA Zh: KONFIGURIMET (Rregullimi i 404) ---
    await page.goto(`${URL_BAZE}/biznes/konfigurimet/profili`);
    
    await expect(page.getByText('404')).not.toBeVisible();
    await expect(page.getByText('Internal Server Error')).not.toBeVisible();
    
    // Përdorim Role dhe Name për të shmangur konfliktin me h1-të e tjera
    const titulliProfilit = page.getByRole('heading', { name: 'Profili i Biznesit', exact: true });
    await expect(titulliProfilit).toBeVisible();
    
    console.log('✅ Faza Zh: Auditimi përfundoi. Faqja e Profilit punon perfekt!');
  });

});