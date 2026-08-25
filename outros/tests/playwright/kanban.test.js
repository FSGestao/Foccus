// tests/playwright/kanban.test.js
// Playwright test suite for Foccus Kanban UI enhancements

const { test, expect } = require('@playwright/test');

/** Utility to switch to Kanban view. Adjust selector as needed. */
async function switchToKanban(page) {
  const kanbanBtn = page.locator('[data-view="kanban"]');
  if (await kanbanBtn.count()) {
    await kanbanBtn.click();
    await page.waitForLoadState('networkidle');
  }
}

test.describe('Kanban UI enhancements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await switchToKanban(page);
  });

  test('Kanban view occupies full width', async ({ page }) => {
    const main = page.locator('main');
    const width = await main.evaluate((el) => getComputedStyle(el).width);
    const viewport = page.viewportSize();
    const viewportWidth = viewport ? viewport.width : 1280;
    const widthPx = parseFloat(width.replace('px', ''));
    expect(widthPx).toBeGreaterThanOrEqual(viewportWidth * 0.95);
  });

  test('Priority dropdown colors are updated', async ({ page }) => {
    const newTaskBtn = page.locator('[data-action="new-task"]');
    await newTaskBtn.click();
    const prioritySelect = page.locator('select');
    const optionP3 = prioritySelect.locator('option[value="P3"]');
    const styleP3 = await optionP3.getAttribute('style');
    expect(styleP3).toContain('color:#1e40af');
    const optionP4 = prioritySelect.locator('option[value="P4"]');
    const styleP4 = await optionP4.getAttribute('style');
    expect(styleP4).toContain('color:#4d7c0f');
  });

  test('Tasks are ordered correctly within project groups', async ({ page }) => {
    const newTaskBtn = page.locator('[data-action="new-task"]');
    // Create first task (earlier due date)
    await newTaskBtn.click();
    await page.fill('input[name="title"]', 'Task Early');
    await page.fill('input[name="dueDate"]', '2023-01-01');
    await page.selectOption('select[name="priority"]', 'P2');
    await page.click('button:has-text("Salvar")');
    // Create second task (later due date)
    await newTaskBtn.click();
    await page.fill('input[name="title"]', 'Task Late');
    await page.fill('input[name="dueDate"]', '2025-12-31');
    await page.selectOption('select[name="priority"]', 'P3');
    await page.click('button:has-text("Salvar")');
    // Verify ordering – first row should be "Task Early"
    const firstTaskTitle = page.locator('.task-row >> nth=0 >> .task-title');
    await expect(firstTaskTitle).toHaveText('Task Early');
  });
});
