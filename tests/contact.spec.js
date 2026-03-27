const { test, expect } = require('@playwright/test');

test('Check for new logos and phone number on contact page', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/contact.html');
  await page.screenshot({ path: '/home/swebot/jules-scratch/verification/contact.png' });
});
