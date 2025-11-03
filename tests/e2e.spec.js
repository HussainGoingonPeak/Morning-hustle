const { test, expect } = require('@playwright/test');

test('Check for logo on all pages', async ({ page }) => {
  const pages = ['index.html', 'pricing.html', 'contact.html', 'login.html', 'admin-login.html', 'admin-dashboard.html'];

  for (const p of pages) {
    await page.goto(`http://127.0.0.1:8080/${p}`);
    const logo = page.locator('img[alt="Morning Hustle Logo"]');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', 'assets/logo.jpg');
  }
});

test('Check for MH Digital Assistant avatar', async ({ page }) => {
    await page.goto('http://127.0.0.1:8080/index.html');
    const avatar = page.locator('img[alt="MH Digital Assistant Avatar"]');
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute('src', 'assets/logo.jpg');
});
