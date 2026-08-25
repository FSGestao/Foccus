const { chromium } = require('playwright-core');
const dir = 'C:/Users/IVAN~1.SER/AppData/Local/Temp/claude/c--Users-ivan-sereno-Desktop-Code-Foccus/da443da2-e31c-49e0-bd4f-c455c1a921a2/scratchpad/guide/';
const fs = require('fs');
fs.mkdirSync(dir, { recursive: true });

async function openMenu(page) {
  const isOpen = await page.evaluate(() => !!document.querySelector('[title="Clique para fechar o menu"]'));
  if (!isOpen) {
    await page.click('button[title*="Menu"]');
    await page.waitForTimeout(350);
  }
}
async function closeMenu(page) {
  const backdrop = await page.$('[title="Clique para fechar o menu"]');
  if (backdrop) {
    await backdrop.click();
    await page.waitForTimeout(350);
  }
}
async function dismissOverlays(page) {
  for (const sel of ['[title="Clique fora para fechar o painel"]', '[title="Clique fora para fechar"]']) {
    const el = await page.$(sel);
    if (el) { await el.click().catch(()=>{}); await page.waitForTimeout(250); }
  }
}
async function nav(page, label) {
  await dismissOverlays(page);
  await openMenu(page);
  await page.evaluate((label) => {
    const links = Array.from(document.querySelectorAll('a'));
    const el = links.find(a => a.textContent.trim() === label);
    if (el) el.click();
  }, label);
  await page.waitForTimeout(500);
  await closeMenu(page);
}
async function shot(page, name, clip) {
  try {
    await page.screenshot({ path: dir + name + '.png', clip });
    console.log('OK', name);
  } catch (e) {
    console.log('SHOT FAIL', name, e.message);
  }
}
async function safe(label, fn) {
  try { await fn(); } catch (e) { console.log('STEP FAIL', label, e.message); }
}

(async () => {
  const errors = [];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5 });
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
  page.on('dialog', async d => { await d.dismiss().catch(()=>{}); });

  await page.goto('http://localhost:8000/Foccus.dc.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  await safe('01_header', async () => shot(page, '01_header', { x: 0, y: 0, width: 1280, height: 46 }));

  await safe('02_sidebar', async () => {
    await openMenu(page);
    await shot(page, '02_sidebar', { x: 0, y: 0, width: 210, height: 560 });
    await closeMenu(page);
  });

  await safe('03_list_overview', async () => shot(page, '03_list_overview', { x: 55, y: 60, width: 1225, height: 420 }));

  await safe('04_new_task_modal', async () => {
    await page.keyboard.press('n');
    await page.waitForTimeout(400);
    await shot(page, '04_new_task_modal', { x: 340, y: 130, width: 600, height: 420 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  await safe('05_task_drawer', async () => {
    await page.click('.task-list-row', { timeout: 8000 });
    await page.waitForTimeout(500);
    await shot(page, '05_task_drawer', { x: 800, y: 0, width: 480, height: 900 });
    await page.click('[title="Clique fora para fechar o painel"]', { timeout: 8000 });
    await page.waitForTimeout(300);
  });

  await safe('nav_projects', async () => nav(page, 'Projetos'));
  await safe('06_projects_grid', async () => shot(page, '06_projects_grid', { x: 55, y: 60, width: 1225, height: 420 }));

  await safe('07_edit_project_modal', async () => {
    await dismissOverlays(page);
    await page.click('button[title="Renomear projeto"]', { timeout: 8000 });
    await page.waitForTimeout(400);
    await shot(page, '07_edit_project_modal', { x: 390, y: 260, width: 500, height: 260 });
    await page.click('button:has-text("Cancelar")', { timeout: 8000 });
    await page.waitForTimeout(300);
  });

  await safe('08_project_detail', async () => {
    await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[title^="Ver detalhes e tarefas do projeto"]'));
      if (els[0]) els[0].click();
    });
    await page.waitForTimeout(500);
    await shot(page, '08_project_detail', { x: 55, y: 60, width: 1225, height: 400 });
  });

  await safe('nav_people', async () => nav(page, 'Pessoas'));
  await safe('09_people_grid', async () => shot(page, '09_people_grid', { x: 55, y: 60, width: 1225, height: 320 }));

  await safe('10_new_person_modal', async () => {
    await dismissOverlays(page);
    await page.click('button:has-text("+ Nova Pessoa")', { timeout: 8000 });
    await page.waitForTimeout(400);
    await shot(page, '10_new_person_modal', { x: 390, y: 260, width: 500, height: 300 });
    await page.click('button:has-text("Cancelar")', { timeout: 8000 });
    await page.waitForTimeout(300);
  });

  await safe('nav_waiting', async () => nav(page, 'Aguardando'));
  await safe('11_waiting_view', async () => shot(page, '11_waiting_view', { x: 55, y: 60, width: 1225, height: 420 }));

  await safe('nav_kanban', async () => nav(page, 'Kanban'));
  await safe('12_kanban_board', async () => shot(page, '12_kanban_board', { x: 55, y: 60, width: 1225, height: 460 }));
  await safe('13_kanban_groupby', async () => shot(page, '13_kanban_groupby', { x: 950, y: 60, width: 330, height: 60 }));

  await safe('nav_notes', async () => nav(page, 'Anotações'));
  await safe('14_notes_view', async () => shot(page, '14_notes_view', { x: 55, y: 60, width: 1225, height: 480 }));

  await safe('nav_dashboard', async () => nav(page, 'Dashboard'));
  await safe('15_dashboard_top', async () => shot(page, '15_dashboard_top', { x: 55, y: 60, width: 1225, height: 470 }));

  async function clickModeTab(label) {
    await page.evaluate((label) => {
      const links = Array.from(document.querySelectorAll('a'));
      const el = links.find(a => a.textContent.trim() === label);
      if (el) el.click();
    }, label);
    await page.waitForTimeout(450);
  }

  await safe('16_dashboard_gantt', async () => {
    await clickModeTab('Gantt');
    await shot(page, '16_dashboard_gantt', { x: 55, y: 60, width: 1225, height: 420 });
  });

  await safe('17_dashboard_burndown', async () => {
    await clickModeTab('Burndown');
    await shot(page, '17_dashboard_burndown', { x: 55, y: 60, width: 1225, height: 420 });
  });

  await safe('18_dashboard_overview', async () => {
    await clickModeTab('Visão Geral');
    await shot(page, '18_dashboard_overview', { x: 55, y: 60, width: 1225, height: 500 });
  });

  await safe('19_shortcuts_modal', async () => {
    await page.click('button[title*="Atalhos"]', { timeout: 8000 });
    await page.waitForTimeout(400);
    await shot(page, '19_shortcuts_modal', { x: 400, y: 120, width: 480, height: 420 });
  });

  console.log('ERRORS:', JSON.stringify(errors, null, 2));
  await browser.close();
})();
