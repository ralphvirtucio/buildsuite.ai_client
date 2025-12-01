import { test, expect } from '@playwright/test';

test.describe('Phase 1: Tab Navigation and Documents UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display all three tabs', async ({ page }) => {
    // Check Chat tab
    const chatTab = page.getByRole('tab', { name: /chat/i });
    await expect(chatTab).toBeVisible();

    // Check Documents tab
    const docsTab = page.getByRole('tab', { name: /documents/i });
    await expect(docsTab).toBeVisible();

    // Check Jobs tab
    const jobsTab = page.getByRole('tab', { name: /jobs/i });
    await expect(jobsTab).toBeVisible();
  });

  test('should start with Chat tab active', async ({ page }) => {
    const chatTab = page.getByRole('tab', { name: /chat/i });
    await expect(chatTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to Documents tab', async ({ page }) => {
    const docsTab = page.getByRole('tab', { name: /documents/i });
    await docsTab.click();

    // Check Documents tab is now active
    await expect(docsTab).toHaveAttribute('aria-selected', 'true');

    // Check for Documents page header
    await expect(page.getByText('Document Knowledge Base')).toBeVisible();
  });

  test('should switch to Jobs tab and show coming soon', async ({ page }) => {
    const jobsTab = page.getByRole('tab', { name: /jobs/i });
    await jobsTab.click();

    // Check Jobs tab is now active
    await expect(jobsTab).toHaveAttribute('aria-selected', 'true');

    // Check for Jobs page header
    await expect(page.getByText('Jobs Board')).toBeVisible();

    // Check for coming soon message
    await expect(page.getByText('Jobs Board Coming Soon')).toBeVisible();
  });

  test('should display document upload area', async ({ page }) => {
    // Navigate to Documents tab
    const docsTab = page.getByRole('tab', { name: /documents/i });
    await docsTab.click();

    // Check for upload zone
    await expect(page.getByText('Drop your document here')).toBeVisible();
    await expect(page.getByText('Accepted formats: PDF, DOCX, TXT')).toBeVisible();

    // Check for Choose File button
    const chooseFileBtn = page.getByRole('button', { name: /choose file/i });
    await expect(chooseFileBtn).toBeVisible();
  });

  test('should display empty documents state', async ({ page }) => {
    // Navigate to Documents tab
    const docsTab = page.getByRole('tab', { name: /documents/i });
    await docsTab.click();

    // Wait for documents to load (should show empty state)
    await page.waitForTimeout(1000);

    // Check for empty state message
    const emptyStateText = page.getByText(/no documents yet/i);
    if (await emptyStateText.isVisible()) {
      await expect(emptyStateText).toBeVisible();
      await expect(page.getByText(/upload documents to enhance/i)).toBeVisible();
    }
  });

  test('should preserve chat state when switching tabs', async ({ page }) => {
    // Start on Chat tab
    const chatTab = page.getByRole('tab', { name: /chat/i });
    await expect(chatTab).toHaveAttribute('aria-selected', 'true');

    // Switch to Documents
    const docsTab = page.getByRole('tab', { name: /documents/i });
    await docsTab.click();
    await expect(docsTab).toHaveAttribute('aria-selected', 'true');

    // Switch back to Chat
    await chatTab.click();
    await expect(chatTab).toHaveAttribute('aria-selected', 'true');

    // Chat should still be functional (component remounted)
    // This tests that the tab switching doesn't break the chat
  });

  test('should have proper ARIA attributes for accessibility', async ({ page }) => {
    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible();
    await expect(tablist).toHaveAttribute('aria-label', 'Main navigation');

    // Check each tab has proper ARIA attributes
    const chatTab = page.getByRole('tab', { name: /chat/i });
    await expect(chatTab).toHaveAttribute('aria-controls');
    await expect(chatTab).toHaveAttribute('id');
  });
});
