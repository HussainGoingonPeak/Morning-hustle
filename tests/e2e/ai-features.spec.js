// tests/e2e/ai-features.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Unified AI Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the index page before each test
    await page.goto('http://localhost:8080/index.html');
    // Wait for the main content to be visible to ensure the page is loaded
    await page.waitForSelector('main');
  });

  test('should load with chat mode active by default', async ({ page }) => {
    // Check that chat mode button is styled as active
    await expect(page.locator('#chat-mode-btn')).toHaveClass(/bg-gray-800/);
    await expect(page.locator('#image-mode-btn')).toHaveClass(/bg-gray-200/);

    // Check placeholder text
    await expect(page.locator('#ai-prompt')).toHaveAttribute('placeholder', 'Ask the assistant anything...');

    // Check response box initial content
    await expect(page.locator('#response-box')).toContainText('Chat responses will appear here.');
  });

  test('should switch to image mode and update UI correctly', async ({ page }) => {
    // Click the image mode button
    await page.click('#image-mode-btn');

    // Check that image mode button is styled as active
    await expect(page.locator('#image-mode-btn')).toHaveClass(/bg-gray-800/);
    await expect(page.locator('#chat-mode-btn')).toHaveClass(/bg-gray-200/);

    // Check placeholder text
    await expect(page.locator('#ai-prompt')).toHaveAttribute('placeholder', 'Describe the image you want to create...');

    // Check response box initial content for image mode
    await expect(page.locator('#response-box')).toContainText('Generated images will appear here.');
  });

  test('should display an error message if chat API key is missing', async ({ page }) => {
    // Ensure we are in chat mode (default)
    await page.fill('#ai-prompt', 'Hello, world!');
    await page.click('button[type="submit"]');

    // The error message should appear. The loader might flash too quickly to catch,
    // so we focus on the final, important state.
    const errorMessage = page.locator('#response-box .flex.justify-start:last-of-type');
    await expect(errorMessage).toContainText('The OpenRouter API key is not configured.');
  });

  test('should display an error message if image API key is missing', async ({ page }) => {
    // Switch to image mode
    await page.click('#image-mode-btn');

    await page.fill('#ai-prompt', 'A beautiful landscape');
    await page.click('button[type="submit"]');

    // The error message should appear.
    await expect(page.locator('#response-box')).toContainText('The Bytez/Prodia API key is not configured.');
  });

  test('should show user message immediately in chat mode', async ({ page }) => {
    const userPrompt = 'This is a test prompt';
    await page.fill('#ai-prompt', userPrompt);
    await page.click('button[type="submit"]');

    // Check that the user's message appears instantly
    const userMessage = page.locator('#response-box .flex.justify-end');
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toContainText(userPrompt);

    // The AI's error response should also appear, confirming the submission was processed
    const errorMessage = page.locator('#response-box .flex.justify-start:last-of-type');
    await expect(errorMessage).toContainText('The OpenRouter API key is not configured.');
  });
});
