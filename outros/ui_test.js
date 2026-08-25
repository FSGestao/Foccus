const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const serverPort = 8000;
  const url = `http://localhost:${serverPort}/Pauta.dc.html`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push(msg.text());
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('Failed to load page:', e);
    await browser.close();
    process.exit(1);
  }

  const elements = await page.$$('[onclick], button, input[type="button"], input[type="submit"], a[href]');
  let totalClicked = 0;
  const brokenFlows = [];

  for (const el of elements) {
    try {
      const tag = await el.evaluate(node => node.tagName);
      await el.scrollIntoViewIfNeeded();
      await el.click({ timeout: 2000 });
      totalClicked++;
      // Wait briefly for possible navigation or modal changes
      await page.waitForTimeout(500);
    } catch (err) {
      brokenFlows.push(`Error clicking ${await el.evaluate(node => node.outerHTML)}: ${err.message}`);
    }
  }

  const report = {
    totalElementsClicked: totalClicked,
    consoleErrors: consoleMessages,
    brokenFlows: brokenFlows
  };

  const reportDir = path.join(__dirname, 'test_reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const reportPath = path.join(reportDir, 'ui_test_report_pt.md');
  const markdown = `# Relatório de Teste de UI\n\n` +
    `**Total de elementos clicados:** ${report.totalElementsClicked}\n\n` +
    `## Erros de console\n` +
    (report.consoleErrors.length ? report.consoleErrors.map(e => `- ${e}`).join('\n') : 'Nenhum') + '\n\n' +
    `## Fluxos quebrados\n` +
    (report.brokenFlows.length ? report.brokenFlows.map(e => `- ${e}`).join('\n') : 'Nenhum');

  fs.writeFileSync(reportPath, markdown, 'utf8');
  console.log('Report written to', reportPath);

  await browser.close();
})();
