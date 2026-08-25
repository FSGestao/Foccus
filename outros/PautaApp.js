function getTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function getTomorrowStr() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function addDaysStr(baseDate, days) {
  const [y, m, d] = (baseDate || getTodayStr()).split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const ry = date.getFullYear();
  const rm = String(date.getMonth() + 1).padStart(2, '0');
  const rd = String(date.getDate()).padStart(2, '0');
  return `${ry}-${rm}-${rd}`;
}

const TODAY = getTodayStr();
const TOMORROW = getTomorrowStr();

const PRIORITY_COLOR = {
  P1: '#ef4444',
  P2: '#f59e0b',
  P3: '#1e40af',
  P4: '#4d7c0f'
};
const STATUS_LABEL = {
  INBOX: 'Inbox', TODO: 'A Fazer', IN_PROGRESS: 'Em andamento', WAITING: 'Aguardando',
  BLOCKED: 'Bloqueada', DONE: 'Concluída', CANCELLED: 'Cancelada'
};
const PROJECT_COLOR = {
  simplifica: '#6366f1', dashboard: '#06b6d4', compras: '#a855f7',
  contabil: '#f59e0b', financeira: '#3b82f6', mef: '#ec4899',
  estoque: '#10b981'
};
const STATUS_OPTIONS = [
  { value: 'INBOX', label: '📥 Inbox' }, { value: 'TODO', label: '○ A Fazer' },
  { value: 'IN_PROGRESS', label: '◐ Em andamento' }, { value: 'WAITING', label: '⏳ Aguardando' },
  { value: 'BLOCKED', label: '⛔ Bloqueada' }, { value: 'DONE', label: '✓ Concluída' },
  { value: 'CANCELLED', label: '⨯ Cancelada' }
];

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function seedProjects() {
  return [
    { id: 'simplifica', name: 'Simplifica', priority: 'P1', status: 'ACTIVE', progress: 67, dueDate: addDaysStr(TODAY, 11) },
    { id: 'dashboard', name: 'Dashboard', priority: 'P2', status: 'ACTIVE', progress: 40, dueDate: addDaysStr(TODAY, 18) },
    { id: 'compras', name: 'Compras', priority: 'P3', status: 'ACTIVE', progress: 30, dueDate: addDaysStr(TODAY, 25) },
    { id: 'contabil', name: 'Consolidação Contábil', priority: 'P4', status: 'ACTIVE', progress: 20, dueDate: addDaysStr(TODAY, 33) },
    { id: 'financeira', name: 'Consolidação Financeira', priority: 'P2', status: 'ACTIVE', progress: 35, dueDate: addDaysStr(TODAY, 28) },
    { id: 'mef', name: 'MEF', priority: 'P1', status: 'ACTIVE', progress: 90, dueDate: addDaysStr(TODAY, 3) },
    { id: 'estoque', name: 'Estoque', priority: 'P4', status: 'PAUSED', progress: 10, dueDate: null }
  ];
}
function seedPeople() {
  return [
    { id: 'renato', name: 'Renato', role: 'Financeiro' },
    { id: 'nicholas', name: 'Nicholas', role: 'Testes / QA' },
    { id: 'luiz', name: 'Luiz', role: 'Arquitetura / TI' },
    { id: 'claudio', name: 'Claudio', role: 'Compras' },
    { id: 'ligia', name: 'Ligia', role: 'Financeiro' },
    { id: 'gustavo', name: 'Gustavo', role: 'Comercial Linx' },
    { id: 'dorival', name: 'Dorival', role: 'Negócio' },
    { id: 'lucas', name: 'Lucas', role: 'Sustentação' },
    { id: 'wagner', name: 'Wagner', role: 'Suporte' }
  ];
}
function h(date, desc) { return { date, desc }; }
function seedTasks() {
  let n = 1;
  const t = (o) => ({
    id: 't' + (n++), description: '', notes: '', tags: [], checklist: [], checklistDraft: '',
    followUpDate: null, waitingFor: null, waitingReason: '', blockedBy: null, dependsOnTaskId: null,
    estimatedMinutes: null, createdAt: addDaysStr(TODAY, -8), updatedAt: TODAY, completedAt: null,
    parentTaskId: null, dueDate: null, history: [h(fmtDate(addDaysStr(TODAY, -8)), 'Tarefa criada')],
    ...o
  });
  return [
    t({ title: 'pedir para SIA revisar os meus projetos', projectId: null, priority: 'P3', status: 'INBOX' }),
    t({ title: 'Ata das calls', projectId: null, priority: 'P3', status: 'INBOX' }),
    t({ title: 'Dar Ok no caderno de testes', projectId: null, priority: 'P2', status: 'INBOX' }),

    t({ title: 'Confirmar pagamento de entrada ao fornecedor', projectId: 'simplifica', priority: 'P1', status: 'TODO', dueDate: TODAY,
      description: 'Confirmar se o pagamento da entrada foi realizado.',
      checklist: [{ id: 'c1', text: 'Verificar financeiro', done: false }, { id: 'c2', text: 'Confirmar fornecedor', done: false }],
      notes: 'Pagamento relacionado ao projeto Simplifica.',
      history: [h(fmtDate(TODAY), 'Tarefa criada'), h(fmtDate(TODAY), 'Prioridade alterada para P1')] }),

    t({ title: 'Incluir CR das planilhas (faturado, estoque e emplacamento)', projectId: 'dashboard', priority: 'P2', status: 'WAITING',
      waitingFor: 'renato', waitingReason: 'Consolidar CR das planilhas', followUpDate: TOMORROW }),
    t({ title: 'Plano de cutover técnico e de negócio', projectId: 'dashboard', priority: 'P2', status: 'WAITING',
      waitingFor: 'nicholas', waitingReason: 'Aguardar plano de testes', followUpDate: TODAY }),

    t({ title: 'sistema para consulta de cadastro - qual o status?', projectId: 'compras', priority: 'P3', status: 'TODO' }),
    t({ title: 'Cobrar Luiz sobre arquitetura', projectId: 'compras', priority: 'P3', status: 'WAITING',
      waitingFor: 'luiz', waitingReason: 'Retorno sobre arquitetura', createdAt: addDaysStr(TODAY, -4), followUpDate: TODAY }),
    t({ title: 'Confirmar com o Claudio quantas pessoas estarão envolvidas no processo de compras, para retornar no tema de quantidade de licenças', projectId: 'compras', priority: 'P3', status: 'WAITING',
      waitingFor: 'claudio', waitingReason: 'Quantidade de pessoas no processo de compras', followUpDate: addDaysStr(TODAY, 2) }),

    t({ title: 'Criar Status Report para enviar para o negócio / enviar via grupo também', projectId: 'contabil', priority: 'P4', status: 'TODO', dueDate: TOMORROW }),

    t({ title: 'Validar FTEs consolidação financeira com Ligia', projectId: 'financeira', priority: 'P2', status: 'WAITING',
      waitingFor: 'ligia', waitingReason: 'Validar FTEs', followUpDate: '2026-08-21' }),
    t({ title: 'Conversar com o comercial do Linx para saber custos sobre módulos', projectId: 'financeira', priority: 'P2', status: 'TODO', dueDate: '2026-08-11' }),
    t({ title: 'Conversar com Gustavo sobre as ideias e como tirar um relatório agendado, e como converter o arquivo do banco Santander para um formato aceito pelo Linx (Itaú ou Bradesco)', projectId: 'financeira', priority: 'P3', status: 'TODO' }),
    t({ title: 'Buscar ferramentas para fazer a identificação dos valores recebidos por pix/transferência', projectId: 'financeira', priority: 'P3', status: 'TODO' }),
    t({ title: 'Levantar com a Ligia a volumetria de pix, transferência e financiamento', projectId: 'financeira', priority: 'P2', status: 'WAITING',
      waitingFor: 'ligia', waitingReason: 'Volumetria de pix/transferência/financiamento', followUpDate: '2026-08-21' }),
    t({ title: 'Avaliar possibilidade de retirar transferência da lista de pagamentos', projectId: 'financeira', priority: 'P3', status: 'TODO' }),
    t({ title: 'Seguir com teste de QR code da Linx', projectId: 'financeira', priority: 'P2', status: 'IN_PROGRESS' }),
    t({ title: 'Formalizar que o Linx não atende o layout de outros bancos', projectId: 'financeira', priority: 'P3', status: 'TODO' }),
    t({ title: 'Conversar com o Dorival se o de-para poderia resolver', projectId: 'financeira', priority: 'P3', status: 'WAITING',
      waitingFor: 'dorival', waitingReason: 'Avaliar se o de-para resolve', followUpDate: '2026-08-22' }),
    t({ title: 'Incluir requisitos técnicos e funcionais e HUs', projectId: 'financeira', priority: 'P3', status: 'TODO' }),
    t({ title: 'Enviar docs de requisitos à Ligia e as-is', projectId: 'financeira', priority: 'P3', status: 'TODO' }),
    t({ title: 'Confirmar volumetria e se podemos retirar transferência', projectId: 'financeira', priority: 'P2', status: 'BLOCKED',
      blockedBy: 'depende da validação de FTEs', dependsOnTaskId: 't10' }),

    t({ title: 'Criar documentação de projetos', projectId: 'mef', priority: 'P2', status: 'TODO' }),
    t({ title: 'Acompanharemos até o dia 14/08 em Produção', projectId: 'mef', priority: 'P2', status: 'DONE', completedAt: '2026-08-14' }),
    t({ title: 'Comunicado de issue por email, seguirá até 14/08 e após será com o time de sustentação', projectId: 'mef', priority: 'P2', status: 'DONE', completedAt: '2026-08-14' }),
    t({ title: 'Tratar com Lucas sustentação pós-hipercare', projectId: 'mef', priority: 'P1', status: 'WAITING',
      waitingFor: 'lucas', waitingReason: 'Sustentação pós-hipercare', followUpDate: '2026-08-19' }),
    t({ title: 'Termo de encerramento do MEF', projectId: 'mef', priority: 'P1', status: 'TODO', dueDate: '2026-08-21' }),

    t({ title: 'Pedido de informações para a Slimstock para criarmos uma estimativa', projectId: 'estoque', priority: 'P4', status: 'TODO' }),
    t({ title: 'Criar o processo inverso de valor, apresentar a plataforma para os donos de processo e identificar aderência', projectId: 'estoque', priority: 'P4', status: 'TODO' }),
    t({ title: 'Responder email da Slimstock, encaminhado para o Wagner - confirmar se a informação está no chamado', projectId: 'estoque', priority: 'P4', status: 'WAITING',
      waitingFor: 'wagner', waitingReason: 'Confirmar informação no chamado', followUpDate: '2026-08-20' })
  ];
}

function themeTokens(theme) {
  return theme === 'dark'
    ? {
        bg: '#0e1015',
        surface: '#151820',
        surfaceSubtle: '#1b1f2b',
        border: 'rgba(255,255,255,0.08)',
        borderHover: 'rgba(255,255,255,0.16)',
        text: '#f1f3f7',
        textRgb: '241,243,247',
        textMuted: 'rgba(241,243,247,0.6)',
        textDim: 'rgba(241,243,247,0.55)',
        accent: '#5e6ad2',
        accentBg: 'rgba(94,106,210,0.14)',
        onAccent: '#ffffff',
        hover: 'rgba(255,255,255,0.04)',
        hoverStrong: 'rgba(255,255,255,0.08)',
        yellow: '#f59e0b',
        yellowBg: 'rgba(245,158,11,0.14)',
        yellowText: '#fbbf24',
        onYellow: '#0e1015',
        calendarFilter: 'invert(1)'
      }
    : {
        bg: '#f8f9fa',
        surface: '#ffffff',
        surfaceSubtle: '#f1f3f5',
        border: 'rgba(0,0,0,0.08)',
        borderHover: 'rgba(0,0,0,0.16)',
        text: '#111827',
        textRgb: '17,24,39',
        textMuted: 'rgba(17,24,39,0.62)',
        textDim: 'rgba(17,24,39,0.55)',
        accent: '#4f46e5',
        accentBg: 'rgba(79,70,229,0.08)',
        onAccent: '#ffffff',
        hover: 'rgba(0,0,0,0.03)',
        hoverStrong: 'rgba(0,0,0,0.06)',
        yellow: '#d97706',
        yellowBg: 'rgba(217,119,6,0.1)',
        yellowText: '#b45309',
        onYellow: '#ffffff',
        calendarFilter: 'invert(0)'
      };
}

function navIcon(key) {
  const s = { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const E = React.createElement;
  const map = {
    list: E('svg', s, E('rect', { key: 1, x: 2, y: 2.5, width: 3, height: 3, rx: 0.8 }), E('line', { key: 2, x1: 7, y1: 4, x2: 14, y2: 4 }), E('rect', { key: 3, x: 2, y: 9.5, width: 3, height: 3, rx: 0.8 }), E('line', { key: 4, x1: 7, y1: 11, x2: 14, y2: 11 })),
    inbox: E('svg', s, E('rect', { key: 1, x: 1.5, y: 2.5, width: 13, height: 11, rx: 1.5 }), E('line', { key: 2, x1: 1.5, y1: 8, x2: 5.5, y2: 8 }), E('line', { key: 3, x1: 10.5, y1: 8, x2: 14.5, y2: 8 }), E('path', { key: 4, d: 'M5.5 8a2.5 2.5 0 0 0 5 0' })),
    projects: E('svg', s, E('rect', { key: 1, x: 1.5, y: 1.5, width: 5.5, height: 5.5, rx: 1 }), E('rect', { key: 2, x: 9, y: 1.5, width: 5.5, height: 5.5, rx: 1 }), E('rect', { key: 3, x: 1.5, y: 9, width: 5.5, height: 5.5, rx: 1 }), E('rect', { key: 4, x: 9, y: 9, width: 5.5, height: 5.5, rx: 1 })),
    people: E('svg', s, E('circle', { key: 1, cx: 8, cy: 5, r: 2.8 }), E('path', { key: 2, d: 'M2.5 14c0-2.8 2.5-4.4 5.5-4.4S13.5 11.2 13.5 14' })),
    waiting: E('svg', s, E('circle', { key: 1, cx: 8, cy: 8, r: 6 }), E('line', { key: 2, x1: 8, y1: 8, x2: 8, y2: 4.8 }), E('line', { key: 3, x1: 8, y1: 8, x2: 10.5, y2: 9.5 })),
    calendar: E('svg', s, E('rect', { key: 1, x: 1.5, y: 3, width: 13, height: 11, rx: 1.5 }), E('line', { key: 2, x1: 1.5, y1: 6.5, x2: 14.5, y2: 6.5 }), E('line', { key: 3, x1: 4.5, y1: 1.5, x2: 4.5, y2: 4 }), E('line', { key: 4, x1: 11.5, y1: 1.5, x2: 11.5, y2: 4 })),
    kanban: E('svg', s, E('rect', { key: 1, x: 2, y: 3, width: 4.5, height: 10, rx: 1 }), E('rect', { key: 2, x: 9.5, y: 3, width: 4.5, height: 7, rx: 1 }))
  };
  return map[key] || null;
}
const STORAGE_KEY = 'pauta_app_state_v1';

class Component extends DCLogic {
  constructor() {
    super();
    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || (document.activeElement && document.activeElement.isContentEditable);
      
      if (e.key === 'Escape') {
        this.handleEscape();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector('header input[type="text"]') || document.querySelector('input[type="text"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if ((e.key === 'n' || e.key === 'N') && !isInput && !this.state.selectedTaskId && !this.state.showNewModal && !this.state.showNewProjectModal && !this.state.showNewPersonModal) {
        e.preventDefault();
        this.setState({ showNewModal: true, newTaskDraft: this.emptyDraft() });
      } else if (e.key === '?' && !isInput) {
        e.preventDefault();
        this.setState(s => ({ showShortcutsModal: !s.showShortcutsModal }));
      }
    });
    this.state = {
      userName: localStorage.getItem('foccus_username') || 'Seu Nome',
      tasks: seedTasks(), projects: seedProjects(), people: seedPeople(),
      view: 'list', tab: 'all', search: '',
    filterP1: false, filterWaiting: false, filterBlocked: false, filterOverdue: false,
    selectedTaskIds: [], lastSelectedTaskId: null, expandedTaskIds: [], marqueeBox: { active: false, left: 0, top: 0, width: 0, height: 0 },
    bulkModalType: null, bulkSelectedProjectId: '', bulkSelectedPriority: 'P3',
    activeProjectId: null, activePersonId: null,
    selectedTaskId: null, editingDateId: null,
    showNewModal: false, newTaskDraft: this.emptyDraft(),
    inboxDraft: '', followUpOpenId: null, followUpDrafts: {}, toasts: [], showNewProjectModal: false, showNewPersonModal: false, newProjectDraft: {name:'', color:'#6366f1'}, newPersonDraft: {name:'', role:''},
      menuOpen: false, groupBy: 'none', quickAddDraft: '', theme: 'light', kanbanGroupBy: 'status',
      projectFilter: 'all', peopleFilter: 'all', filterProject: 'all', filterPerson: 'all', calendarOffset: 0, showShortcutsModal: false
    };
  }

  componentDidMount() {
    this.setupMarqueeSelection();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.projectColors && typeof saved.projectColors === 'object') {
          Object.assign(PROJECT_COLOR, saved.projectColors);
        }
        this.setState({
          tasks: saved.tasks || this.state.tasks,
          projects: saved.projects || this.state.projects,
          people: saved.people || this.state.people,
          theme: saved.theme || 'light'
        });
      }
    } catch (e) {}
  }
  componentDidUpdate() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          tasks: this.state.tasks,
          projects: this.state.projects,
          people: this.state.people,
          theme: this.state.theme,
          projectColors: PROJECT_COLOR
        }));
      } catch (e) {}
    }, 500);
  }

  showToast(msg, type = 'success', action = null, onAction = null) {
    const id = Date.now();
    this.setState(s => ({ toasts: [...s.toasts, { id, msg, type, action, onAction: () => { if (onAction) onAction(); this.setState(st => ({ toasts: st.toasts.filter(t => t.id !== id) })); } }] }));
    setTimeout(() => { this.setState(s => ({ toasts: s.toasts.filter(t => t.id !== id) })); }, 4000);
  }

  handleEscape() {
    this.setState({ taskDrawerOpen: false, modalOpen: false, showNewModal: false, bulkModalType: null, showNewProjectModal: false, showNewPersonModal: false, showEditUserModal: false, showEditProjectModal: false, showEditPersonModal: false, showConfirmModal: false, showShortcutsModal: false, selectedTaskIds: [] });
  }

  emptyDraft() {
    return { title: '', projectId: '', priority: 'P3', status: 'TODO', dueDate: '', waitingFor: '', description: '' };
  }

  findTask(id) { return this.state.tasks.find(t => t.id === id); }
  findProject(id) { return this.state.projects.find(p => p.id === id); }
  findPerson(id) { return this.state.people.find(p => p.id === id); }

  updateTask(id, patch, note) {
    this.setState(s => ({
      tasks: s.tasks.map(t => t.id !== id ? t : {
        ...t, ...patch, updatedAt: TODAY,
        history: note ? [...t.history, h(TODAY, note)] : t.history
      })
    }));
  }
  toggleDone(id) {
    const t = this.findTask(id);
    if (t.status === 'DONE') this.updateTask(id, { status: 'TODO', completedAt: null }, 'Conclusão desfeita');
    else this.updateTask(id, { status: 'DONE', completedAt: TODAY }, 'Tarefa concluída');
  }
  
  setupMarqueeSelection() {
    if (this._marqueeSetupDone) return;
    this._marqueeSetupDone = true;

    window.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const target = e.target;
      if (target.closest('input, textarea, select, button, a, [role="dialog"], aside, header, .no-marquee, .modal-overlay, [data-prevent-marquee]')) {
        return;
      }
      const main = target.closest('main');
      if (!main) return;

      this._marqueeStartX = e.clientX;
      this._marqueeStartY = e.clientY;
      this._marqueeDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this._marqueeStartX === undefined || this._marqueeStartX === null) return;
      const dx = e.clientX - this._marqueeStartX;
      const dy = e.clientY - this._marqueeStartY;
      if (!this._marqueeDragging && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        this._marqueeDragging = true;
      }
      if (this._marqueeDragging) {
        const left = Math.min(this._marqueeStartX, e.clientX);
        const top = Math.min(this._marqueeStartY, e.clientY);
        const width = Math.abs(e.clientX - this._marqueeStartX);
        const height = Math.abs(e.clientY - this._marqueeStartY);
        
        const marqueeRect = { left, top, right: left + width, bottom: top + height };
        
        const rowElements = document.querySelectorAll('[data-task-id]');
        const newlySelected = [];
        rowElements.forEach(el => {
          const id = el.getAttribute('data-task-id');
          if (!id) return;
          const rect = el.getBoundingClientRect();
          const intersects = !(
            rect.right < marqueeRect.left ||
            rect.left > marqueeRect.right ||
            rect.bottom < marqueeRect.top ||
            rect.top > marqueeRect.bottom
          );
          if (intersects) {
            newlySelected.push(id);
          }
        });

        this.setState({
          marqueeBox: { active: true, left, top, width, height },
          selectedTaskIds: e.shiftKey ? Array.from(new Set([...this.state.selectedTaskIds, ...newlySelected])) : newlySelected
        });
      }
    });

    window.addEventListener('mouseup', () => {
      if (this._marqueeDragging) {
        this._marqueeDragging = false;
        this.setState({ marqueeBox: { active: false, left: 0, top: 0, width: 0, height: 0 } });
        window._justFinishedMarquee = true;
        setTimeout(() => { window._justFinishedMarquee = false; }, 120);
      }
      this._marqueeStartX = null;
      this._marqueeStartY = null;
    });
  }

  getCurrentVisibleTasks() {
    const s = this.state;
    if (s.search && s.search.trim()) {
      return this.sortTasks(s.tasks.filter(t => t.status !== 'CANCELLED' && this.matchesSearch(t, s.search)));
    }
    if (s.view === 'inbox') {
      return s.tasks.filter(t => t.status === 'INBOX');
    }
    if (s.view === 'projectDetail' && s.activeProjectId) {
      return this.sortTasks(s.tasks.filter(t => t.projectId === s.activeProjectId && t.status !== 'CANCELLED'));
    }
    let pool = s.tasks.filter(t => t.status !== 'INBOX' && t.status !== 'CANCELLED');
    if (s.tab === 'today') {
      pool = pool.filter(t => {
        const d = t.status === 'WAITING' ? t.followUpDate : t.dueDate;
        return !!d && d <= TODAY;
      });
    } else if (s.tab === 'done') {
      pool = s.tasks.filter(t => t.status === 'DONE');
    } else {
      pool = pool.filter(t => t.status !== 'DONE');
    }
    if (s.filterProject && s.filterProject !== 'all') {
      pool = pool.filter(t => (t.projectId || 'inbox') === s.filterProject || (s.filterProject === 'inbox' && !t.projectId));
    }
    if (s.filterPerson && s.filterPerson !== 'all') {
      pool = pool.filter(t => t.waitingFor === s.filterPerson);
    }
    const sorted = this.sortTasks(pool);
    return sorted.length > 0 ? sorted : s.tasks;
  }

  handleTaskRowClick(taskId, e) {
    if (window._justFinishedMarquee || window._isDraggingCard) return;

    if (e && e.shiftKey && this.state.lastSelectedTaskId) {
      const listTasks = this.getCurrentVisibleTasks();
      const idx1 = listTasks.findIndex(t => t.id === this.state.lastSelectedTaskId);
      const idx2 = listTasks.findIndex(t => t.id === taskId);
      if (idx1 !== -1 && idx2 !== -1) {
        const start = Math.min(idx1, idx2);
        const end = Math.max(idx1, idx2);
        const rangeIds = listTasks.slice(start, end + 1).map(t => t.id);
        const newSelected = Array.from(new Set([...this.state.selectedTaskIds, ...rangeIds]));
        this.setState({ selectedTaskIds: newSelected, lastSelectedTaskId: taskId });
        return;
      }
    }

    if (e && (e.ctrlKey || e.metaKey)) {
      this.setState(s => {
        const exists = s.selectedTaskIds.includes(taskId);
        return {
          selectedTaskIds: exists ? s.selectedTaskIds.filter(id => id !== taskId) : [...s.selectedTaskIds, taskId],
          lastSelectedTaskId: taskId
        };
      });
      return;
    }

    if (this.state.selectedTaskIds.length > 0) {
      this.setState(s => {
        const exists = s.selectedTaskIds.includes(taskId);
        return {
          selectedTaskIds: exists ? s.selectedTaskIds.filter(id => id !== taskId) : [...s.selectedTaskIds, taskId],
          lastSelectedTaskId: taskId
        };
      });
      return;
    }

    this.openTask(taskId);
  }

  applyBulkProjectValue(projectId) {
    const { selectedTaskIds, projects } = this.state;
    if (!selectedTaskIds.length) return;
    const project = projects.find(p => p.id === projectId);
    const projName = project ? project.name : 'Inbox (sem projeto)';
    const note = `Projeto alterado em lote para ${projName}`;
    const count = selectedTaskIds.length;
    this.setState(s => ({
      tasks: s.tasks.map(t => selectedTaskIds.includes(t.id) ? {
        ...t,
        projectId: projectId || null,
        updatedAt: TODAY,
        history: [...(t.history || []), h(TODAY, note)]
      } : t),
      selectedTaskIds: []
    }));
    this.showToast(`Projeto "${projName}" atribuído a ${count} tarefa(s)!`);
  }

  applyBulkPriorityValue(priority) {
    const { selectedTaskIds } = this.state;
    if (!selectedTaskIds.length) return;
    const note = `Prioridade alterada em lote para ${priority}`;
    const count = selectedTaskIds.length;
    this.setState(s => ({
      tasks: s.tasks.map(t => selectedTaskIds.includes(t.id) ? {
        ...t,
        priority,
        updatedAt: TODAY,
        history: [...(t.history || []), h(TODAY, note)]
      } : t),
      selectedTaskIds: []
    }));
    this.showToast(`Prioridade ${priority} definida para ${count} tarefa(s)!`);
  }

  deleteTask(id) {
    const backupTasks = this.state.tasks;
    this.setState(s => ({ tasks: s.tasks.filter(t => t.id !== id), selectedTaskId: null }));
    this.showToast('Tarefa excluída', 'success', 'Desfazer', () => { this.setState({ tasks: backupTasks }); });
  }
  applyBulkProject() {
    const { selectedTaskIds, bulkSelectedProjectId, projects } = this.state;
    if (!selectedTaskIds.length) return;
    const project = projects.find(p => p.id === bulkSelectedProjectId);
    const projName = project ? project.name : 'Inbox (sem projeto)';
    const note = `Projeto alterado em lote para ${projName}`;
    this.setState(s => ({
      tasks: s.tasks.map(t => selectedTaskIds.includes(t.id) ? {
        ...t,
        projectId: bulkSelectedProjectId || null,
        updatedAt: TODAY,
        history: [...(t.history || []), h(TODAY, note)]
      } : t),
      selectedTaskIds: [],
      bulkModalType: null
    }));
  }
  applyBulkPriority() {
    const { selectedTaskIds, bulkSelectedPriority } = this.state;
    if (!selectedTaskIds.length) return;
    const note = `Prioridade alterada em lote para ${bulkSelectedPriority}`;
    this.setState(s => ({
      tasks: s.tasks.map(t => selectedTaskIds.includes(t.id) ? {
        ...t,
        priority: bulkSelectedPriority,
        updatedAt: TODAY,
        history: [...(t.history || []), h(TODAY, note)]
      } : t),
      selectedTaskIds: [],
      bulkModalType: null
    }));
  }
  applyBulkComplete() {
    const { selectedTaskIds } = this.state;
    if (!selectedTaskIds.length) return;
    const note = 'Concluída em lote';
    this.setState(s => ({
      tasks: s.tasks.map(t => selectedTaskIds.includes(t.id) ? {
        ...t,
        status: 'DONE',
        completedAt: TODAY,
        updatedAt: TODAY,
        history: [...(t.history || []), h(TODAY, note)]
      } : t),
      selectedTaskIds: []
    }));
  }
    applyBulkDelete() {
    const { selectedTaskIds, tasks } = this.state;
    if (!selectedTaskIds.length) return;
    const backupTasks = [...tasks];
    const count = selectedTaskIds.length;
    this.setState(s => ({
      tasks: s.tasks.filter(t => !selectedTaskIds.includes(t.id)),
      selectedTaskIds: [],
      selectedTaskId: null
    }));
    this.showToast(`${count} tarefa(s) excluída(s)`, 'success', 'Desfazer', () => {
      this.setState({ tasks: backupTasks });
    });
  }

  openTask(id) { this.setState({ selectedTaskId: id, editingDateId: null }); }
  closeTask() { this.setState({ selectedTaskId: null }); }

  toggleTheme() {
    this.setState(s => {
      const newTheme = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('foccus_theme', newTheme);
      return { theme: newTheme };
    });
  }

  changeName() {
    this.setState({ showEditUserModal: true, editUserNameDraft: this.state.userName });
  }
  submitEditUser() {
    if (this.state.editUserNameDraft && this.state.editUserNameDraft.trim()) {
      this.setState({ userName: this.state.editUserNameDraft.trim(), showEditUserModal: false });
      this.showToast('Nome alterado');
    }
  }

  addProject() {
    this.setState({ showNewProjectModal: true, newProjectDraft: {name: '', color: '#6366f1'} });
  }
  submitNewProject() {
    const name = this.state.newProjectDraft.name;
    if (!name || !name.trim()) return;
    const id = 'p' + Date.now();
    PROJECT_COLOR[id] = this.state.newProjectDraft.color || '#6366f1';
    this.setState(s => ({ projects: [...s.projects, { id, name: name.trim(), priority: 'P3', status: 'ACTIVE', progress: 0, dueDate: null }], showNewProjectModal: false }));
    this.showToast('Projeto criado com sucesso!');
  }

  deleteProject(id) {
    const p = this.findProject(id);
    if (!p) return;
    const taskCount = this.state.tasks.filter(t => t.projectId === id && t.status !== 'CANCELLED').length;
    const msg = taskCount > 0
      ? `Excluir o projeto "${p.name}"?\nAs ${taskCount} tarefas deste projeto serão mantidas e movidas para o Inbox.`
      : `Excluir o projeto "${p.name}"?`;
    this.setState({ showConfirmModal: true, confirmPayload: { type: 'project', id, msg } });
  }

  confirmAction() {
    const payload = this.state.confirmPayload;
    if (!payload) return;
    if (payload.type === 'project') {
      const id = payload.id;
      const p = this.findProject(id);
      this.setState(s => ({
        projects: s.projects.filter(pr => pr.id !== id),
        tasks: s.tasks.map(t => t.projectId === id ? { ...t, projectId: null, updatedAt: TODAY, history: [...(t.history || []), h(fmtDate(TODAY), `Desvinculada do projeto excluído "${p ? p.name : ''}"`)] } : t),
        view: 'projects',
        activeProjectId: null,
        showConfirmModal: false,
        confirmPayload: null
      }));
      this.showToast('Projeto excluído');
    } else if (payload.type === 'person') {
      const id = payload.id;
      this.setState(s => ({
        people: s.people.filter(pr => pr.id !== id),
        tasks: s.tasks.map(t => t.waitingFor === id ? { ...t, waitingFor: null, updatedAt: TODAY, history: [...(t.history || []), h(fmtDate(TODAY), `Responsável desvinculado (pessoa excluída)`)] } : t),
        view: 'people',
        activePersonId: null,
        showConfirmModal: false,
        confirmPayload: null
      }));
      this.showToast('Pessoa excluída');
    }
  }

  renameProject(id) {
    const p = this.findProject(id);
    if (!p) return;
    this.setState({ showEditProjectModal: true, editProjectDraft: { id, name: p.name } });
  }
  submitEditProject() {
    const draft = this.state.editProjectDraft;
    if (!draft.name || !draft.name.trim()) return;
    this.setState(s => ({
      projects: s.projects.map(pr => pr.id === draft.id ? { ...pr, name: draft.name.trim() } : pr),
      showEditProjectModal: false
    }));
    this.showToast('Projeto renomeado');
  }

  addPerson(callback) {
    this.setState({ showNewPersonModal: true, newPersonDraft: {name: '', role: 'Geral'}, pendingPersonCallback: callback });
    return null;
  }
  submitNewPerson() {
    const name = this.state.newPersonDraft.name;
    if (!name || !name.trim()) return;
    const role = this.state.newPersonDraft.role || 'Geral';
    const id = 'ps' + Date.now();
    const newPerson = { id, name: name.trim(), role: role.trim(), status: 'ACTIVE' };
    this.setState(s => ({ people: [...s.people, newPerson], showNewPersonModal: false }), () => {
      if (typeof this.state.pendingPersonCallback === 'function') this.state.pendingPersonCallback(newPerson);
      this.setState({ pendingPersonCallback: null });
    });
    this.showToast('Pessoa adicionada!');
  }

  addPersonForSelectedTask() {
    this.addPerson((newPerson) => {
      if (this.state.selectedTaskId && newPerson) {
        this.updateTask(this.state.selectedTaskId, { waitingFor: newPerson.id }, `Aguardando definido para ${newPerson.name}`);
      }
    });
  }

  addPersonForNewTask() {
    this.addPerson((newPerson) => {
      if (newPerson) {
        this.setState(st => ({ newTaskDraft: { ...st.newTaskDraft, waitingFor: newPerson.id } }));
      }
    });
  }

  deletePerson(id) {
    const p = this.findPerson(id);
    if (!p) return;
    const waitingCount = this.state.tasks.filter(t => t.waitingFor === id && t.status !== 'CANCELLED' && t.status !== 'DONE').length;
    const msg = waitingCount > 0
      ? `Excluir "${p.name}"?\nAs ${waitingCount} pendências aguardando esta pessoa terão o responsável desvinculado.`
      : `Excluir "${p.name}"?`;
    this.setState({ showConfirmModal: true, confirmPayload: { type: 'person', id, msg } });
  }

  editPerson(id) {
    const p = this.findPerson(id);
    if (!p) return;
    this.setState({ showEditPersonModal: true, editPersonDraft: { id, name: p.name, role: p.role || '' } });
  }
  submitEditPerson() {
    const draft = this.state.editPersonDraft;
    if (!draft.name || !draft.name.trim()) return;
    this.setState(s => ({
      people: s.people.map(pr => pr.id === draft.id ? { ...pr, name: draft.name.trim(), role: (draft.role || '').trim() } : pr),
      showEditPersonModal: false
    }));
    this.showToast('Pessoa atualizada');
  }

  togglePersonStatus(id) {
    const p = this.findPerson(id);
    if (!p) return;
    const newStatus = (p.status || 'ACTIVE') === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.setState(s => ({
      people: s.people.map(pp => pp.id === id ? { ...pp, status: newStatus } : pp)
    }));
  }

  isOverdue(task, dateStr) {
    return !!dateStr && dateStr < TODAY && task.status !== 'DONE' && task.status !== 'CANCELLED';
  }
  dateLabelFor(task, dateStr) {
    if (!dateStr) return '';
    if (this.isOverdue(task, dateStr)) return fmtDate(dateStr);
    if (dateStr === TODAY) return 'Hoje';
    if (dateStr === TOMORROW) return 'Amanhã';
    return fmtDate(dateStr);
  }

  buildRow(task, opts) {
    opts = opts || {};
    const project = this.findProject(task.projectId);
    const person = task.waitingFor ? this.findPerson(task.waitingFor) : null;
    const relevantDate = task.status === 'WAITING' ? task.followUpDate : task.dueDate;
    const overdue = this.isOverdue(task, relevantDate);
    const dateLabel = this.dateLabelFor(task, relevantDate);
    const editingDate = this.state.editingDateId === task.id;
    const projectColor = project ? (PROJECT_COLOR[project.id] || '#6366f1') : 'rgba(var(--pb-text-rgb),0.3)';
    const isSelected = this.state.selectedTaskIds.includes(task.id);
    const isExpanded = this.state.expandedTaskIds.includes(task.id);
    const hasSubtasks = task.checklist && task.checklist.length > 0;
    const rowStyle = `display:flex;align-items:center;gap:12px;padding:8px 12px;cursor:pointer;transition:all .12s ease;background:${isSelected ? 'var(--pb-accent-bg)' : 'transparent'};border-left:3px solid ${isSelected ? 'var(--pb-accent)' : 'transparent'};`;
    return {
      id: task.id, title: task.title, done: task.status === 'DONE',
      isSelected, isExpanded, hasSubtasks, rowStyle,
      onRowClick: (e) => { this.handleTaskRowClick(task.id, e); },
      onSelect: (e) => {
        if (e) e.stopPropagation();
        this.setState(s => ({
          selectedTaskIds: isSelected ? s.selectedTaskIds.filter(id => id !== task.id) : [...s.selectedTaskIds, task.id],
          lastSelectedTaskId: task.id
        }));
      },
      onToggleExpand: (e) => {
        e.stopPropagation();
        this.setState(s => ({
          expandedTaskIds: isExpanded ? s.expandedTaskIds.filter(id => id !== task.id) : [...s.expandedTaskIds, task.id]
        }));
      },
      subtasks: (task.checklist || []).map((sub, i) => ({
        id: sub.id, text: sub.text, done: sub.done,
        onToggle: (e) => {
          e.stopPropagation();
          const newChecklist = [...task.checklist];
          newChecklist[i] = { ...sub, done: !sub.done };
          this.updateTask(task.id, { checklist: newChecklist });
        }
      })),
      titleStyle: task.status === 'DONE'
        ? 'text-decoration:line-through;color:var(--pb-text-dim);font-weight:400;font-size:13.5px;'
        : 'font-size:13.5px;font-weight:400;color:var(--pb-text);',
      checkStyle: `width:16px;height:16px;flex:none;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:10px;line-height:1;color:#fff;border:1.5px solid ${task.status === 'DONE' ? '#10b981' : 'var(--pb-border-hover)'};background:${task.status === 'DONE' ? '#10b981' : 'transparent'};padding:0;transition:all .1s ease;`,
      checkMark: task.status === 'DONE' ? '✓' : '',
      projectName: project ? project.name : 'Inbox',
      projectDotStyle: `display:inline-block;width:6px;height:6px;border-radius:50%;background:${projectColor};margin-right:1px;flex-shrink:0;`,
      priority: task.priority, priorityLabel: task.priority,
      priorityStyle: `color:${PRIORITY_COLOR[task.priority]};font-weight:600;border:none;background:transparent;appearance:none;-webkit-appearance:none;font-family:inherit;font-size:11.5px;cursor:pointer;padding:0;outline:none;`,
      showWaiting: task.status === 'WAITING' && !!person,
      waitingPersonName: person ? person.name : '',
      isBlocked: task.status === 'BLOCKED', blockedReason: task.blockedBy,
      showDate: !!dateLabel && task.status !== 'BLOCKED',
      dateLabel, editingDate, editingDateOff: !editingDate,
      dateStyle: overdue ? 'color:#800020;font-weight:600;cursor:pointer;' : (task.status === 'WAITING' ? 'color:oklch(62% 0.14 75);cursor:pointer;' : 'cursor:pointer;color:var(--pb-text-muted);'),
      rawDateValue: relevantDate || '',
      onOpen: () => this.openTask(task.id),
      onToggle: (e) => { e.stopPropagation(); this.toggleDone(task.id); },
      stop: (e) => e.stopPropagation(),
      onPriorityChange: (e) => { this.updateTask(task.id, { priority: e.target.value }, `Prioridade alterada para ${e.target.value}`); },
      onDateLabelClick: (e) => { e.stopPropagation(); this.setState({ editingDateId: task.id }); },
      onDateInputChange: (e) => {
        const field = task.status === 'WAITING' ? 'followUpDate' : 'dueDate';
        this.updateTask(task.id, { [field]: e.target.value }, 'Prazo alterado');
        this.setState({ editingDateId: null });
      },
      onDateInputBlur: () => this.setState({ editingDateId: null })
    };
  }

  matchesSearch(task, q) {
    if (!q) return true;
    q = q.toLowerCase();
    const project = this.findProject(task.projectId);
    const person = task.waitingFor ? this.findPerson(task.waitingFor) : null;
    return task.title.toLowerCase().includes(q)
      || (task.description || '').toLowerCase().includes(q)
      || (project && project.name.toLowerCase().includes(q))
      || (person && person.name.toLowerCase().includes(q));
  }

  sortTasks(tasks) {
    const groupRank = (task) => {
      const d = task.status === 'WAITING' ? task.followUpDate : task.dueDate;
      if (this.isOverdue(task, d)) return 0;
      if (d === TODAY) return 1;
      if (d) return 2;
      return 3;
    };
    return [...tasks].sort((a, b) => {
      if (a.status === 'DONE' && b.status === 'DONE') {
        const dateA = a.completedAt || '';
        const dateB = b.completedAt || '';
        if (dateA !== dateB) return dateB.localeCompare(dateA);
      }
      if (a.status === 'DONE' && b.status !== 'DONE') return 1;
      if (b.status === 'DONE' && a.status !== 'DONE') return -1;
      const gr = groupRank(a) - groupRank(b);
      if (gr !== 0) return gr;
      return a.priority.localeCompare(b.priority);
    });
  }

  sanitize(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }


  handleKanbanDrop(taskId, targetColId, groupBy) {
    const task = this.findTask(taskId);
    if (!task) return;
    if (groupBy === 'status') {
      if (task.status === targetColId) return;
      const isDone = targetColId === 'DONE';
      this.updateTask(taskId, {
        status: targetColId,
        completedAt: isDone ? (task.completedAt || TODAY) : null
      }, `Status alterado via Kanban para ${STATUS_LABEL[targetColId] || targetColId}`);
      this.showToast(`Status atualizado para ${STATUS_LABEL[targetColId] || targetColId}`);
    } else if (groupBy === 'priority') {
      if (task.priority === targetColId) return;
      this.updateTask(taskId, { priority: targetColId }, `Prioridade alterada via Kanban para ${targetColId}`);
      this.showToast(`Prioridade alterada para ${targetColId}`);
    } else if (groupBy === 'project') {
      const newProjectId = targetColId === 'none' ? null : targetColId;
      if (task.projectId === newProjectId) return;
      const project = this.findProject(newProjectId);
      this.updateTask(taskId, { projectId: newProjectId }, `Projeto alterado via Kanban para ${project ? project.name : 'Inbox'}`);
      this.showToast(`Movido para ${project ? project.name : 'Inbox'}`);
    }
  }

  prevCalendarWeek() { this.setState(s => ({ calendarOffset: (s.calendarOffset || 0) - 1 })); }
  nextCalendarWeek() { this.setState(s => ({ calendarOffset: (s.calendarOffset || 0) + 1 })); }
  todayCalendarWeek() { this.setState({ calendarOffset: 0 }); }

  renderVals() {
    const s = this.state;
    const tk = themeTokens(s.theme);
    const themeVarsStyle = `--pb-bg:${tk.bg};--pb-surface:${tk.surface};--pb-surface-subtle:${tk.surfaceSubtle};--pb-border:${tk.border};--pb-border-hover:${tk.borderHover};--pb-text:${tk.text};--pb-text-rgb:${tk.textRgb};--pb-text-muted:${tk.textMuted};--pb-text-dim:${tk.textDim};--pb-accent:${tk.accent};--pb-accent-bg:${tk.accentBg};--pb-on-accent:${tk.onAccent};--pb-hover:${tk.hover};--pb-hover-strong:${tk.hoverStrong};--pb-yellow:${tk.yellow};--pb-yellow-bg:${tk.yellowBg};--pb-yellow-text:${tk.yellowText};--pb-on-yellow:${tk.onYellow};--pb-calendar-filter:${tk.calendarFilter};`;
    const openTasks = s.tasks.filter(t => t.status !== 'INBOX' && t.status !== 'CANCELLED' && t.status !== 'DONE');
    // Progresso global
    const totalTasks = s.tasks.filter(t => t.status !== 'INBOX' && t.status !== 'CANCELLED').length;
    const doneTasks = s.tasks.filter(t => t.status === 'DONE').length;
    const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    const names = s.userName.split(' ');
    const userFirstName = names[0];
    const userInitials = names.length > 1 ? (names[0][0] + names[names.length - 1][0]).toUpperCase() : names[0][0].toUpperCase();

    const navKeys = [
      ['list', 'Minha Lista'], ['inbox', 'Inbox'], ['projects', 'Projetos'], ['people', 'Pessoas'], ['waiting', 'Aguardando'], ['calendar', 'Calendário'], ['kanban', 'Kanban'],
    ];
    const navItems = navKeys.map(([key, label]) => {
      const active = s.view === key && !s.search;
      return {
        label, tooltip: label, icon: navIcon(key), onClick: (e) => { e.preventDefault(); this.setState({ view: key, search: '', menuOpen: false }); },
        ariaCurrent: active ? 'page' : 'false',
        style: `display:flex;align-items:center;gap:10px;padding:7px 10px;text-decoration:none;font-size:13px;border-radius:6px;color:${active ? 'var(--pb-accent)' : 'var(--pb-text)'};font-weight:${active ? '600' : '400'};background:${active ? 'var(--pb-accent-bg)' : 'transparent'};transition:all .12s ease;`
      };
    });

    const currentDateStr = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    const isSearching = s.search.trim().length > 0;
    const searchResults = isSearching
      ? this.sortTasks(s.tasks.filter(t => t.status !== 'CANCELLED' && this.matchesSearch(t, s.search))).map(t => this.buildRow(t))
      : [];

    // tabs / list view
    const tabDefs = [
      { key: 'all', label: 'Todas' }, { key: 'today', label: 'Hoje' }, { key: 'done', label: 'Concluídas' }
    ];
    const tabs = tabDefs.map(td => {
      const active = s.tab === td.key;
      return {
        label: td.label, onClick: (e) => { e.preventDefault(); this.setState({ tab: td.key }); },
        style: `padding:6px 12px;text-decoration:none;font-size:13px;border-radius:6px;color:${active ? 'var(--pb-text)' : 'var(--pb-text-muted)'};font-weight:${active ? '600' : '400'};background:${active ? 'var(--pb-surface-subtle)' : 'transparent'};transition:all .12s ease;border:1px solid ${active ? 'var(--pb-border)' : 'transparent'};`
      };
    });

    const qfDefs = [
      { key: 'filterP1', label: '⚑ P1' },
      { key: 'filterWaiting', label: '⏳ Aguardando' },
      { key: 'filterBlocked', label: '⛔ Bloqueadas' },
      { key: 'filterOverdue', label: '⚠️ Atrasadas' }
    ];
    const quickFilters = qfDefs.map(qf => {
      const active = s[qf.key];
      return {
        label: qf.label,
        onClick: (e) => { e.preventDefault(); this.setState({ [qf.key]: !active }); },
        style: `cursor:pointer;font-family:inherit;padding:4px 10px;font-size:11.5px;border-radius:20px;font-weight:500;transition:all .1s ease;border:1px solid ${active ? 'var(--pb-accent)' : 'var(--pb-border)'};background:${active ? 'var(--pb-accent-bg)' : 'var(--pb-surface)'};color:${active ? 'var(--pb-accent)' : 'var(--pb-text-dim)'};`
      };
    });

    let tabPool = [];
    if (s.tab === 'all') tabPool = openTasks;
    else if (s.tab === 'today') tabPool = openTasks.filter(t => {
      const d = t.status === 'WAITING' ? t.followUpDate : t.dueDate;
      return !!d && d <= TODAY;
    });
    else if (s.tab === 'overdue') tabPool = openTasks.filter(t => this.isOverdue(t, t.status === 'WAITING' ? t.followUpDate : t.dueDate));
    else if (s.tab === 'waiting') tabPool = s.tasks.filter(t => t.status === 'WAITING');
    else if (s.tab === 'blocked') tabPool = s.tasks.filter(t => t.status === 'BLOCKED');
    else if (s.tab === 'done') tabPool = s.tasks.filter(t => t.status === 'DONE');

    // Filter pills (AND logic on top of the selected tab)
    if (s.filterP1 || s.filterWaiting || s.filterBlocked || s.filterOverdue) {
      tabPool = tabPool.filter(t => {
        let match = true;
        if (s.filterP1 && t.priority !== 'P1') match = false;
        if (s.filterWaiting && t.status !== 'WAITING') match = false;
        if (s.filterBlocked && t.status !== 'BLOCKED') match = false;
        if (s.filterOverdue && !this.isOverdue(t, t.status === 'WAITING' ? t.followUpDate : t.dueDate)) match = false;
        return match;
      });
    }

    // Dropdown filters (Project and Person)
    if (s.filterProject && s.filterProject !== 'all') {
      tabPool = tabPool.filter(t => (t.projectId || 'inbox') === s.filterProject || (s.filterProject === 'inbox' && !t.projectId));
    }
    if (s.filterPerson && s.filterPerson !== 'all') {
      tabPool = tabPool.filter(t => t.waitingFor === s.filterPerson);
    }
    const sortedTabPool = this.sortTasks(tabPool);
    const visibleTasks = sortedTabPool.map(t => this.buildRow(t));

    const groupByNone = s.groupBy === 'none';
    let groupedTasks = [];
    if (!groupByNone) {
      if (s.groupBy === 'project') {
        const order = [{ id: null, label: 'Inbox' }, ...s.projects.map(p => ({ id: p.id, label: p.name }))];
        groupedTasks = order.map(o => ({ label: o.label, rows: sortedTabPool.filter(t => (t.projectId || null) === o.id).map(t => this.buildRow(t)) })).filter(g => g.rows.length);
      } else if (s.groupBy === 'priority') {
        groupedTasks = ['P1', 'P2', 'P3', 'P4'].map(p => ({ label: p, rows: sortedTabPool.filter(t => t.priority === p).map(t => this.buildRow(t)) })).filter(g => g.rows.length);
      } else if (s.groupBy === 'due') {
        const dateOf = (t) => t.status === 'WAITING' ? t.followUpDate : t.dueDate;
        const dateMap = new Map();
        const noDateRows = [];
        sortedTabPool.forEach(t => {
          const d = dateOf(t);
          if (!d) {
            noDateRows.push(this.buildRow(t));
          } else {
            if (!dateMap.has(d)) dateMap.set(d, []);
            dateMap.get(d).push(this.buildRow(t));
          }
        });
        const sortedDates = [...dateMap.keys()].sort();
        groupedTasks = sortedDates.map(d => {
          let label = fmtDate(d);
          if (d === TODAY) label = 'Hoje';
          else if (d === TOMORROW) label = 'Amanhã';
          return { label, rows: dateMap.get(d) };
        });
        if (noDateRows.length > 0) {
          groupedTasks.push({ label: 'Sem prazo', rows: noDateRows });
        }
      }
    }

    const summaryStats = [
      { label: 'Hoje', value: openTasks.filter(t => { const d = t.status === 'WAITING' ? t.followUpDate : t.dueDate; return !!d && d <= TODAY; }).length, onClick: () => this.setState({ tab: 'today', filterP1: false, filterWaiting: false, filterBlocked: false, filterOverdue: false }) },
      { label: 'Atrasadas', value: openTasks.filter(t => this.isOverdue(t, t.status === 'WAITING' ? t.followUpDate : t.dueDate)).length, onClick: () => this.setState({ tab: 'all', filterOverdue: true, filterP1: false, filterWaiting: false, filterBlocked: false }) },
      { label: 'Aguardando', value: s.tasks.filter(t => t.status === 'WAITING').length, onClick: () => this.setState({ tab: 'all', filterWaiting: true, filterP1: false, filterBlocked: false, filterOverdue: false }) },
      { label: 'Próximas', value: openTasks.filter(t => { const d = t.status === 'WAITING' ? t.followUpDate : t.dueDate; return d && d > TODAY; }).length, onClick: () => this.setState({ tab: 'all', filterP1: false, filterWaiting: false, filterBlocked: false, filterOverdue: false }) }
    ];

    // inbox
    const inboxTasks = s.tasks.filter(t => t.status === 'INBOX').map(t => this.buildRow(t));

    // Project filtering in Projects view
    const projectFilterTabs = [
      { key: 'all', label: 'Todos' },
      { key: 'ACTIVE', label: 'Ativos' },
      { key: 'PAUSED', label: 'Pausados' },
      { key: 'COMPLETED', label: 'Concluídos' },
      { key: 'ARCHIVED', label: 'Arquivados / Inativos' }
    ].map(tab => {
      const active = (s.projectFilter || 'all') === tab.key;
      return {
        key: tab.key,
        label: tab.label,
        onClick: (e) => { e.preventDefault(); this.setState({ projectFilter: tab.key }); },
        style: `cursor:pointer;font-family:inherit;padding:4px 10px;font-size:11.5px;border-radius:20px;font-weight:500;transition:all .1s ease;border:1px solid ${active ? 'var(--pb-accent)' : 'var(--pb-border)'};background:${active ? 'var(--pb-accent-bg)' : 'var(--pb-surface)'};color:${active ? 'var(--pb-accent)' : 'var(--pb-text-dim)'};`
      };
    });

    const filteredProjects = s.projects.filter(p => {
      const pf = s.projectFilter || 'all';
      if (pf === 'all') return true;
      return (p.status || 'ACTIVE') === pf;
    });

    const projectRows = filteredProjects.map(p => {
      const pTasks = s.tasks.filter(t => t.projectId === p.id && t.status !== 'CANCELLED');
      const open = pTasks.filter(t => t.status !== 'DONE' && t.status !== 'INBOX');
      const overdue = open.filter(t => this.isOverdue(t, t.status === 'WAITING' ? t.followUpDate : t.dueDate));
      const pPriority = p.priority || 'P3';
      const isArchived = p.status === 'ARCHIVED';
      return {
        id: p.id, name: p.name, priority: pPriority, priorityStyle: `color:${PRIORITY_COLOR[pPriority]};font-weight:600;`,
        dotStyle: `display:inline-block;width:7px;height:7px;border-radius:50%;background:${PROJECT_COLOR[p.id] || '#6366f1'};margin-right:8px;flex-shrink:0;`,
        statusLabel: p.status === 'PAUSED' ? 'Pausado' : p.status === 'COMPLETED' ? 'Concluído' : p.status === 'ARCHIVED' ? 'Arquivado' : 'Ativo',
        statusStyle: isArchived ? 'color:var(--pb-text-dim);background:var(--pb-surface-subtle);border:1px solid var(--pb-border);padding:1px 6px;border-radius:4px;font-size:11px;' : (p.status === 'PAUSED' ? 'color:#f59e0b;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);padding:1px 6px;border-radius:4px;font-size:11px;' : (p.status === 'COMPLETED' ? 'color:#10b981;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);padding:1px 6px;border-radius:4px;font-size:11px;' : 'color:var(--pb-accent);background:var(--pb-accent-bg);border:1px solid var(--pb-accent);padding:1px 6px;border-radius:4px;font-size:11px;')),
        openCount: open.length, overdueCount: overdue.length, hasOverdue: overdue.length > 0,
        progress: (s.tasks.filter(t => t.projectId === p.id && t.status === 'DONE').length / (s.tasks.filter(t => t.projectId === p.id && t.status !== 'CANCELLED' && t.status !== 'DELETED').length || 1)) * 100, progressBarStyle: `height:100%;width:${(s.tasks.filter(t => t.projectId === p.id && t.status === 'DONE').length / (s.tasks.filter(t => t.projectId === p.id && t.status !== 'CANCELLED' && t.status !== 'DELETED').length || 1)) * 100}%;background:var(--pb-accent);border-radius:2px;`,
        onOpen: () => this.setState({ view: 'projectDetail', activeProjectId: p.id }),
        onDelete: (e) => { e.stopPropagation(); this.deleteProject(p.id); }
      };
    });

    let activeProject = null, projectDetailTasks = [];
    if (s.activeProjectId) {
      const p = this.findProject(s.activeProjectId);
      if (p) {
        const pPriority = p.priority || 'P3';
        activeProject = {
          id: p.id,
          name: p.name, priority: pPriority, priorityStyle: `color:${PRIORITY_COLOR[pPriority]};font-weight:600;`,
          status: p.status || 'ACTIVE', progress: (s.tasks.filter(t => t.projectId === p.id && t.status === 'DONE').length / (s.tasks.filter(t => t.projectId === p.id && t.status !== 'CANCELLED' && t.status !== 'DELETED').length || 1)) * 100,
          onStatusChange: (e) => this.setState(st => ({ projects: st.projects.map(pr => pr.id === p.id ? { ...pr, status: e.target.value } : pr) })),
          onRename: () => this.renameProject(p.id),
          onDelete: () => this.deleteProject(p.id),
          onToggleArchive: () => {
            const nextStatus = p.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
            this.setState(st => ({ projects: st.projects.map(pr => pr.id === p.id ? { ...pr, status: nextStatus } : pr) }));
          },
          isArchived: p.status === 'ARCHIVED',
          archiveButtonLabel: p.status === 'ARCHIVED' ? 'Reativar projeto' : 'Arquivar projeto'
        };
        projectDetailTasks = this.sortTasks(s.tasks.filter(t => t.projectId === p.id && t.status !== 'CANCELLED')).map(t => this.buildRow(t));
      }
    }

    // People filtering in People view
    const peopleFilterTabs = [
      { key: 'all', label: 'Todos' },
      { key: 'ACTIVE', label: 'Ativos' },
      { key: 'INACTIVE', label: 'Inativos' }
    ].map(tab => {
      const active = (s.peopleFilter || 'all') === tab.key;
      return {
        key: tab.key,
        label: tab.label,
        onClick: (e) => { e.preventDefault(); this.setState({ peopleFilter: tab.key }); },
        style: `cursor:pointer;font-family:inherit;padding:4px 10px;font-size:11.5px;border-radius:20px;font-weight:500;transition:all .1s ease;border:1px solid ${active ? 'var(--pb-accent)' : 'var(--pb-border)'};background:${active ? 'var(--pb-accent-bg)' : 'var(--pb-surface)'};color:${active ? 'var(--pb-accent)' : 'var(--pb-text-dim)'};`
      };
    });

    const filteredPeople = s.people.filter(p => {
      const pf = s.peopleFilter || 'all';
      if (pf === 'all') return true;
      return (p.status || 'ACTIVE') === pf;
    });

    const peopleRows = filteredPeople.map(p => {
      const waitingCount = s.tasks.filter(t => t.status === 'WAITING' && t.waitingFor === p.id).length;
      const isInactive = p.status === 'INACTIVE';
      return {
        id: p.id, name: p.name, role: p.role, initial: p.name[0],
        waitingCount, hasWaiting: waitingCount > 0,
        isInactive,
        statusLabel: isInactive ? 'Inativo' : 'Ativo',
        statusStyle: isInactive ? 'color:var(--pb-text-dim);background:var(--pb-surface-subtle);border:1px solid var(--pb-border);padding:1px 6px;border-radius:4px;font-size:11px;' : 'color:#10b981;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);padding:1px 6px;border-radius:4px;font-size:11px;',
        onOpen: () => this.setState({ view: 'personDetail', activePersonId: p.id }),
        onDelete: (e) => { e.stopPropagation(); this.deletePerson(p.id); }
      };
    });

    let activePerson = null;
    if (s.activePersonId) {
      const p = this.findPerson(s.activePersonId);
      if (p) {
        const wTasks = s.tasks.filter(t => t.status === 'WAITING' && t.waitingFor === p.id);
        const isInactive = p.status === 'INACTIVE';
        activePerson = {
          id: p.id,
          name: p.name, role: p.role, noWaiting: wTasks.length === 0,
          isInactive,
          statusLabel: isInactive ? 'Inativo' : 'Ativo',
          toggleStatusLabel: isInactive ? 'Reativar pessoa' : 'Inativar pessoa',
          waitingTasks: wTasks.map(t => ({
            title: t.title, requestedLabel: fmtDate(t.createdAt) || '—', followUpLabel: fmtDate(t.followUpDate) || '—',
            onOpen: () => this.openTask(t.id)
          })),
          lastInteraction: wTasks.length ? `Último acompanhamento em ${fmtDate(wTasks[0].followUpDate || wTasks[0].createdAt)}` : 'Sem interações pendentes',
          history: wTasks.flatMap(t => (t.history || []).map(hh => ({ date: hh.date, desc: `${t.title}: ${hh.desc}` }))),
          onEdit: () => this.editPerson(p.id),
          onToggleStatus: () => this.togglePersonStatus(p.id),
          onDelete: () => this.deletePerson(p.id)
        };
      }
    }

    // waiting grouped
    const waitingByPerson = {};
    s.tasks.filter(t => t.status === 'WAITING').forEach(t => {
      const pid = t.waitingFor || 'sem-pessoa';
      (waitingByPerson[pid] = waitingByPerson[pid] || []).push(t);
    });
    const waitingGroups = Object.keys(waitingByPerson).map(pid => {
      const person = this.findPerson(pid);
      return {
        personName: person ? person.name : 'Indefinido',
        tasks: waitingByPerson[pid].map(t => ({
          title: t.title, requestedLabel: fmtDate(t.createdAt) || '—', followUpLabel: fmtDate(t.followUpDate) || '—',
          onOpen: () => this.openTask(t.id),
          followUpOpen: s.followUpOpenId === t.id,
          followUpDraft: s.followUpDrafts[t.id] !== undefined ? s.followUpDrafts[t.id] : `Enviei mensagem para ${person ? person.name : ''}.`,
          onOpenFollowUp: (e) => { e.preventDefault(); this.setState(st => ({ followUpOpenId: t.id })); },
          onFollowUpDraftChange: (e) => { const v = e.target.value; this.setState(st => ({ followUpDrafts: { ...st.followUpDrafts, [t.id]: v } })); },
          onFollowUpSubmit: () => {
            const msg = s.followUpDrafts[t.id] || `Enviei mensagem para ${person ? person.name : ''}.`;
            const next = new Date(TODAY); next.setDate(next.getDate() + 3);
            const nextIso = next.toISOString().slice(0, 10);
            this.updateTask(t.id, { followUpDate: nextIso }, msg);
            this.setState({ followUpOpenId: null });
          }
        }))
      };
    });

    // CALENDAR (Lazy & Navigable)
    let calendarDays = [];
    let calendarWeekLabel = '';
    if (s.view === 'calendar') {
      const offsetDays = (s.calendarOffset || 0) * 7;
      const startDate = addDaysStr(TODAY, offsetDays);
      const endDate = addDaysStr(TODAY, offsetDays + 6);
      calendarWeekLabel = `${fmtDate(startDate)} até ${fmtDate(endDate)}`;
      
      const dueOn = (date) => s.tasks
        .filter(t => t.status !== 'INBOX' && t.status !== 'CANCELLED' && (t.dueDate === date || t.followUpDate === date))
        .map(t => ({ 
          time: t.status === 'DONE' ? '✓' : (t.priority || '—'), 
          title: t.title,
          id: t.id,
          isDone: t.status === 'DONE',
          onOpen: () => this.openTask(t.id)
        }));

      for (let i = 0; i < 7; i++) {
        const dStr = addDaysStr(TODAY, offsetDays + i);
        const isToday = dStr === TODAY;
        const isTomorrow = dStr === TOMORROW;
        const dayLabel = isToday ? `Hoje · ${fmtDate(dStr)}` : (isTomorrow ? `Amanhã · ${fmtDate(dStr)}` : fmtDate(dStr));
        calendarDays.push({
          date: dStr,
          label: dayLabel,
          isToday,
          items: dueOn(dStr)
        });
      }
    }

    // KANBAN (Lazy & Drag-Drop enabled)
    const kanbanGroupBy = s.kanbanGroupBy;
    let kanbanColumns = [];
    if (s.view === 'kanban') {
      const kbTasks = s.tasks.filter(t => t.status !== 'INBOX' && t.status !== 'CANCELLED');
      const sortedKbTasks = this.sortTasks(kbTasks);
      
      const makeCard = (t) => {
        const row = this.buildRow(t);
        return {
          ...row,
          onOpen: () => {
            if (window._isDraggingCard) return;
            this.openTask(t.id);
          },
          onDragStart: (e) => {
            window._isDraggingCard = true;
            window._draggedTaskId = t.id;
            if (e && e.dataTransfer) {
              try {
                e.dataTransfer.setData('text/plain', t.id);
                e.dataTransfer.effectAllowed = 'move';
              } catch(err) {}
            }
          },
          onDragEnd: () => {
            setTimeout(() => {
              window._isDraggingCard = false;
              window._draggedTaskId = null;
            }, 100);
          }
        };
      };

      if (kanbanGroupBy === 'status') {
        const order = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'WAITING', 'DONE'];
        kanbanColumns = order.map(st => ({
          label: STATUS_LABEL[st],
          id: st,
          cards: sortedKbTasks.filter(t => t.status === st).map(makeCard),
          onDragOver: (e) => {
            if (e) {
              e.preventDefault();
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            }
          },
          onDrop: (e) => {
            if (e) e.preventDefault();
            const taskId = (e && e.dataTransfer && e.dataTransfer.getData('text/plain')) || window._draggedTaskId;
            if (taskId) {
              this.handleKanbanDrop(taskId, st, 'status');
            }
            window._isDraggingCard = false;
            window._draggedTaskId = null;
          }
        }));
      } else if (kanbanGroupBy === 'project') {
        const order = [{ id: null, label: 'Inbox (Sem Projeto)' }, ...s.projects.map(p => ({ id: p.id, label: p.name }))];
        kanbanColumns = order.map(o => ({
          label: o.label,
          id: o.id || 'none',
          cards: sortedKbTasks.filter(t => (t.projectId || null) === o.id).map(makeCard),
          onDragOver: (e) => {
            if (e) {
              e.preventDefault();
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            }
          },
          onDrop: (e) => {
            if (e) e.preventDefault();
            const taskId = (e && e.dataTransfer && e.dataTransfer.getData('text/plain')) || window._draggedTaskId;
            if (taskId) {
              this.handleKanbanDrop(taskId, o.id || 'none', 'project');
            }
            window._isDraggingCard = false;
            window._draggedTaskId = null;
          }
        })).filter(c => c.cards.length > 0 || c.id !== 'none');
      } else if (kanbanGroupBy === 'priority') {
        kanbanColumns = ['P1', 'P2', 'P3', 'P4'].map(p => ({
          label: p,
          id: p,
          cards: sortedKbTasks.filter(t => t.priority === p).map(makeCard),
          onDragOver: (e) => {
            if (e) {
              e.preventDefault();
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            }
          },
          onDrop: (e) => {
            if (e) e.preventDefault();
            const taskId = (e && e.dataTransfer && e.dataTransfer.getData('text/plain')) || window._draggedTaskId;
            if (taskId) {
              this.handleKanbanDrop(taskId, p, 'priority');
            }
            window._isDraggingCard = false;
            window._draggedTaskId = null;
          }
        })).filter(c => c.cards.length > 0);
      } else if (kanbanGroupBy === 'due') {
        const dateOf = (t) => t.status === 'WAITING' ? t.followUpDate : t.dueDate;
        const dateMap = new Map();
        const noDateCards = [];
        for (const t of sortedKbTasks) {
          const d = dateOf(t);
          if (!d) {
            noDateCards.push(makeCard(t));
          } else {
            if (!dateMap.has(d)) dateMap.set(d, []);
            dateMap.get(d).push(makeCard(t));
          }
        }
        const sortedDates = Array.from(dateMap.keys()).sort();
        kanbanColumns = [
          ...sortedDates.map(d => ({
            label: fmtDate(d),
            id: d,
            cards: dateMap.get(d),
            onDragOver: (e) => { if (e) e.preventDefault(); },
            onDrop: (e) => {
              if (e) e.preventDefault();
              const taskId = (e && e.dataTransfer && e.dataTransfer.getData('text/plain')) || window._draggedTaskId;
              if (taskId) {
                this.updateTask(taskId, { dueDate: d }, `Prazo alterado para ${fmtDate(d)}`);
                this.showToast(`Prazo definido para ${fmtDate(d)}`);
              }
              window._isDraggingCard = false;
              window._draggedTaskId = null;
            }
          })),
          { 
            label: 'Sem Prazo', 
            id: 'none', 
            cards: noDateCards, 
            onDragOver: (e) => { if (e) e.preventDefault(); }, 
            onDrop: (e) => {
              if (e) e.preventDefault();
              const taskId = (e && e.dataTransfer && e.dataTransfer.getData('text/plain')) || window._draggedTaskId;
              if (taskId) {
                this.updateTask(taskId, { dueDate: null }, 'Prazo removido');
                this.showToast('Prazo removido');
              }
              window._isDraggingCard = false;
              window._draggedTaskId = null;
            }
          }
        ];
      }
    }

    // detail panel
    let selectedTask = null;
    if (s.selectedTaskId) {
      const t = this.findTask(s.selectedTaskId);
      if (t) {
        const dep = t.dependsOnTaskId ? this.findTask(t.dependsOnTaskId) : null;
        selectedTask = {
          id: t.id, title: t.title, onTitleChange: (e) => this.updateTask(t.id, { title: e.target.value }),
          projectId: t.projectId || '', onProjectChange: (e) => this.updateTask(t.id, { projectId: e.target.value || null }, 'Projeto alterado'),
          priority: t.priority, onPriorityChange: (e) => this.updateTask(t.id, { priority: e.target.value }, `Prioridade alterada para ${e.target.value}`),
          status: t.status, onStatusChange: (e) => this.updateTask(t.id, { status: e.target.value }, `Status alterado para ${STATUS_LABEL[e.target.value]}`),
          dueDate: t.dueDate || '', onDueDateChange: (e) => this.updateTask(t.id, { dueDate: e.target.value }, 'Prazo alterado'),
          isWaiting: t.status === 'WAITING',
          followUpDate: t.followUpDate || '', onFollowUpDateChange: (e) => this.updateTask(t.id, { followUpDate: e.target.value }, 'Follow-up alterado'),
          waitingFor: t.waitingFor || '',
          onWaitingForChange: (e) => {
            if (e.target.value === '__new__') {
              this.addPersonForSelectedTask();
            } else {
              this.updateTask(t.id, { waitingFor: e.target.value || null });
            }
          },
          onAddPerson: () => this.addPersonForSelectedTask(),
          waitingReason: t.waitingReason || '', onWaitingReasonChange: (e) => this.updateTask(t.id, { waitingReason: e.target.value }),
          projectOptions: [{ id: '', name: 'Inbox', selected: !t.projectId }, ...s.projects.map(p => ({ id: p.id, name: p.name, selected: p.id === t.projectId }))],
          statusOptions: STATUS_OPTIONS.map(so => ({ value: so.value, label: so.label, selected: so.value === t.status })),
          peopleOptions: [
            { id: '', name: 'Selecionar', selected: !t.waitingFor },
            ...s.people.map(p => ({ id: p.id, name: p.name, selected: p.id === t.waitingFor })),
            { id: '__new__', name: '+ Nova pessoa...', selected: false }
          ],
          hasBlocked: t.status === 'BLOCKED', blockedBy: t.blockedBy || '',
          hasDependency: !!dep, dependencyTitle: dep ? dep.title : '',
          onOpenDependency: (e) => { e.preventDefault(); this.openTask(dep.id); },
          estimatedMinutes: t.estimatedMinutes || '', onEstimateChange: (e) => this.updateTask(t.id, { estimatedMinutes: Number(e.target.value) }),
          description: t.description || '', onDescriptionChange: (e) => this.updateTask(t.id, { description: e.target.value }),
          checklist: t.checklist.map(ci => ({
            id: ci.id, text: ci.text, done: ci.done,
            style: ci.done ? 'text-decoration:line-through;color:var(--pb-text-dim);' : '',
            onToggle: () => this.updateTask(t.id, { checklist: t.checklist.map(x => x.id === ci.id ? { ...x, done: !x.done } : x) })
          })),
          checklistDraft: t.checklistDraft || '',
          onChecklistDraftChange: (e) => this.updateTask(t.id, { checklistDraft: e.target.value }),
          onAddChecklistItem: () => {
            const text = (t.checklistDraft || '').trim(); if (!text) return;
            this.updateTask(t.id, { checklist: [...t.checklist, { id: 'c' + Date.now(), text, done: false }], checklistDraft: '' });
          },
          onChecklistKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); const text = (t.checklistDraft || '').trim(); if (!text) return; this.updateTask(t.id, { checklist: [...t.checklist, { id: 'c' + Date.now(), text, done: false }], checklistDraft: '' }); } },
          notes: t.notes || '', onNotesChange: (e) => this.updateTask(t.id, { notes: e.target.value }),
          comments: (t.comments || []).map(cm => ({
            id: cm.id,
            author: cm.author || 'Usuário',
            date: cm.date || '',
            text: cm.text || ''
          })),
          notes: (t.comments || []).map(cm => ({
            id: cm.id,
            author: cm.author || 'Usuário',
            date: cm.date || '',
            text: cm.text || ''
          })),
          notesCount: (t.comments || []).length,
          commentsCount: (t.comments || []).length,
          noteDraft: t.commentDraft || '',
          commentDraft: t.commentDraft || '',
          onNoteDraftChange: (e) => this.updateTask(t.id, { commentDraft: e.target.value }),
          onCommentDraftChange: (e) => this.updateTask(t.id, { commentDraft: e.target.value }),
          onAddComment: () => {
            const text = (t.commentDraft || '').trim();
            if (!text) return;
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const newComment = { id: 'cm' + Date.now(), author: s.userName || 'Usuário', date: dateStr, text };
            this.updateTask(t.id, {
              comments: [...(t.comments || []), newComment],
              commentDraft: '',
              history: [...(t.history || []), h(TODAY, `Anotação criada por ${s.userName}`)]
            });
            this.showToast('Anotação salva!');
          },
          onAddNote: () => {
            const text = (t.commentDraft || '').trim();
            if (!text) return;
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const newComment = {
              id: 'cm' + Date.now(),
              author: s.userName || 'Usuário',
              date: dateStr,
              text
            };
            this.updateTask(t.id, {
              comments: [...(t.comments || []), newComment],
              commentDraft: '',
              history: [...(t.history || []), h(TODAY, `Anotação salva por ${s.userName}`)]
            });
            this.showToast('Anotação salva!');
          },
          onNoteKeyDown: (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const text = (t.commentDraft || '').trim();
              if (!text) return;
              const now = new Date();
              const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const newComment = {
                id: 'cm' + Date.now(),
                author: s.userName || 'Usuário',
                date: dateStr,
                text
              };
              this.updateTask(t.id, {
                comments: [...(t.comments || []), newComment],
                commentDraft: '',
                history: [...(t.history || []), h(TODAY, `Anotação salva por ${s.userName}`)]
              });
              this.showToast('Anotação salva!');
            }
          },
          completeBtnLabel: t.status === 'DONE' ? 'Desfazer conclusão' : 'Concluir tarefa',
          completeBtnStyle: `cursor:pointer;font-family:inherit;font-weight:500;font-size:13px;color:${t.status === 'DONE' ? 'var(--pb-text)' : '#fff'};background:${t.status === 'DONE' ? 'transparent' : '#10b981'};border:1px solid ${t.status === 'DONE' ? 'var(--pb-border)' : 'transparent'};border-radius:5px;padding:7px 14px;flex:1;transition:all .12s ease;`,
          onToggleDone: () => this.toggleDone(t.id),
          onDelete: () => this.deleteTask(t.id),
          history: [...t.history].reverse()
        };
      }
    }

    const projectOptions = s.projects.map(p => ({ id: p.id, name: p.name }));
    const peopleOptions = s.people.map(p => ({ id: p.id, name: p.name }));

    const nt = s.newTaskDraft;
    const newTask = {
      title: nt.title, onTitleChange: (e) => this.setState(st => ({ newTaskDraft: { ...st.newTaskDraft, title: e.target.value } })),
      onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); this.submitNewTaskInternal(); } },
      projectId: nt.projectId, onProjectChange: (e) => this.setState(st => ({ newTaskDraft: { ...st.newTaskDraft, projectId: e.target.value } })),
      priority: nt.priority, onPriorityChange: (e) => this.setState(st => ({ newTaskDraft: { ...st.newTaskDraft, priority: e.target.value } })),
      status: nt.status, onStatusChange: (e) => this.setState(st => ({ newTaskDraft: { ...st.newTaskDraft, status: e.target.value } })),
      isWaiting: nt.status === 'WAITING',
      dueDate: nt.dueDate, onDueDateChange: (e) => this.setState(st => ({ newTaskDraft: { ...st.newTaskDraft, dueDate: e.target.value } })),
      waitingFor: nt.waitingFor,
      onWaitingForChange: (e) => {
        if (e.target.value === '__new__') {
          this.addPersonForNewTask();
        } else {
          this.setState(st => ({ newTaskDraft: { ...st.newTaskDraft, waitingFor: e.target.value } }));
        }
      },
      onAddPerson: () => this.addPersonForNewTask(),
      description: nt.description, onDescriptionChange: (e) => this.setState(st => ({ newTaskDraft: { ...st.newTaskDraft, description: e.target.value } })),
      projectOptions: [{ id: '', name: 'Inbox', selected: !nt.projectId }, ...s.projects.map(p => ({ id: p.id, name: p.name, selected: p.id === nt.projectId }))],
      statusOptions: STATUS_OPTIONS.map(so => ({ value: so.value, label: so.label, selected: so.value === nt.status })),
      peopleOptions: [
        { id: '', name: 'Selecionar', selected: !nt.waitingFor },
        ...s.people.map(p => ({ id: p.id, name: p.name, selected: p.id === nt.waitingFor })),
        { id: '__new__', name: '+ Nova pessoa...', selected: false }
      ]
    };

    const bulkBar = {
      show: s.selectedTaskIds.length > 0,
      count: s.selectedTaskIds.length,
      countLabel: s.selectedTaskIds.length === 1 ? 'tarefa selecionada' : 'tarefas selecionadas',
      onClear: (e) => { if (e) e.preventDefault(); this.setState({ selectedTaskIds: [] }); },
      onQuickProjectChange: (e) => {
        const val = e.target.value;
        if (val === 'none') this.applyBulkProjectValue(null);
        else if (val) this.applyBulkProjectValue(val);
      },
      onSetP1: (e) => { if (e) e.preventDefault(); this.applyBulkPriorityValue('P1'); },
      onSetP2: (e) => { if (e) e.preventDefault(); this.applyBulkPriorityValue('P2'); },
      onSetP3: (e) => { if (e) e.preventDefault(); this.applyBulkPriorityValue('P3'); },
      onSetP4: (e) => { if (e) e.preventDefault(); this.applyBulkPriorityValue('P4'); },
      onComplete: (e) => { if (e) e.preventDefault(); this.applyBulkComplete(); },
      onDelete: (e) => { if (e) e.preventDefault(); this.applyBulkDelete(); },
      projectOptions: s.projects.map(p => ({ id: p.id, name: p.name }))
    };

    const isKanban = s.view === 'kanban';
    
    // Mini sidebar styles
    const sidebarWidth = s.menuOpen ? '240px' : '64px';
    const sidebarStyle = `position:fixed;top:0;left:0;bottom:0;width:${sidebarWidth};background:var(--pb-surface);border-right:1px solid var(--pb-border);box-shadow:4px 0 24px rgba(0,0,0,0.05);z-index:19;padding:16px ${s.menuOpen ? '14px' : '8px'};display:flex;flex-direction:column;gap:18px;transition:width 0.2s ease, padding 0.2s ease;overflow-x:hidden;`;
    const sidebarHeaderStyle = `display:flex;align-items:center;justify-content:${s.menuOpen ? 'space-between' : 'center'};padding:4px 6px 8px;border-bottom:1px solid var(--pb-border);`;
    const sidebarActionStyle = `display:flex;gap:6px;flex-direction:${s.menuOpen ? 'row' : 'column'};`;
    const newTaskButtonStyle = s.menuOpen 
      ? 'flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font-family:inherit;font-weight:500;font-size:13px;color:var(--pb-on-accent);background:var(--pb-accent);border:none;border-radius:6px;box-shadow:0 1px 2px rgba(0,0,0,0.12);transition:all .12s ease;padding:8px 10px;'
      : 'width:36px;height:36px;margin:0 auto;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:inherit;color:var(--pb-on-accent);background:var(--pb-accent);border:none;border-radius:6px;box-shadow:0 1px 2px rgba(0,0,0,0.12);transition:all .12s ease;';
    const newPersonButtonStyle = s.menuOpen
      ? 'cursor:pointer;font-family:inherit;font-weight:500;font-size:12.5px;color:var(--pb-text);background:var(--pb-surface-subtle);border:1px solid var(--pb-border);border-radius:6px;transition:all .12s ease;padding:8px 10px;display:inline-flex;align-items:center;gap:4px;'
      : 'width:36px;height:36px;margin:0 auto;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:inherit;color:var(--pb-text);background:var(--pb-surface-subtle);border:1px solid var(--pb-border);border-radius:6px;transition:all .12s ease;';

    const mainCanvasStyle = `transition:padding-left 0.2s ease;${isKanban
      ? 'padding:20px 28px 64px calc(28px + '+sidebarWidth+');width:100%;'
      : 'max-width:1040px;margin:0 auto;padding:24px 24px 64px calc(24px + '+sidebarWidth+');'}`;
    const headerContainerStyle = `transition:padding-left 0.2s ease;${isKanban
      ? 'margin:0 auto;height:50px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 28px 0 calc(28px + '+sidebarWidth+');'
      : 'max-width:1040px;margin:0 auto;height:50px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 24px 0 calc(24px + '+sidebarWidth+');'}`;

    return {
      mainCanvasStyle, headerContainerStyle, sidebarStyle, sidebarHeaderStyle, sidebarActionStyle, newTaskButtonStyle, newPersonButtonStyle,
      userFirstName, userInitials, onChangeName: () => this.changeName(),
      addProject: () => this.addProject(), addPerson: () => this.addPerson(),
      addPersonFromMenu: () => { this.setState({ menuOpen: false }); this.addPerson(); },
      navItems, isSearching, search: s.search, onSearchChange: (e) => this.setState({ search: e.target.value }),
      searchResults, noSearchResults: isSearching && searchResults.length === 0,
      showNormalView: !isSearching,
      viewList: s.view === 'list', viewInbox: s.view === 'inbox', viewProjects: s.view === 'projects',
      viewProjectDetail: s.view === 'projectDetail', viewPeople: s.view === 'people', viewPersonDetail: s.view === 'personDetail',
      viewWaiting: s.view === 'waiting', viewCalendar: s.view === 'calendar', viewKanban: s.view === 'kanban',
      kanbanColumns, kanbanGroupBy: s.kanbanGroupBy, onKanbanGroupByChange: (e) => this.setState({ kanbanGroupBy: e.target.value }),
      summaryStats, tabs, quickFilters, bulkBar, marqueeBox: s.marqueeBox || { active: false, left: 0, top: 0, width: 0, height: 0 }, visibleTasks, visibleTasksEmpty: visibleTasks.length === 0,
      groupBy: s.groupBy, groupByNone, groupByActive: !groupByNone, groupedTasks,
      onGroupByChange: (e) => this.setState({ groupBy: e.target.value }),
      quickAddDraft: s.quickAddDraft, onQuickAddChange: (e) => this.setState({ quickAddDraft: e.target.value }),
      onQuickAddKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); this.quickAddInternal(); } },
      menuOpen: s.menuOpen, menuToggleLabel: s.menuOpen ? 'Fechar menu' : 'Menu',
      currentDateStr,
      toggleMenu: () => this.setState(st => ({ menuOpen: !st.menuOpen })),
      themeVarsStyle, theme: s.theme, themeToggleLabel: s.theme === 'dark' ? 'Modo claro' : 'Modo escuro',
      progressPct, doneTasks, totalTasks,
      progressBarStyle: `height:2px;background:var(--pb-accent);width:${progressPct}%;transition:width 0.4s ease;`,
      toggleTheme: () => this.toggleTheme(),
      inboxDraft: s.inboxDraft, onInboxDraftChange: (e) => this.setState({ inboxDraft: e.target.value }),
      onInboxKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); this.addInboxTaskInternal(); } },
      addInboxTask: () => this.addInboxTaskInternal(),
      inboxTasks, inboxEmpty: inboxTasks.length === 0,
      projectFilterTabs, projectRows, projectsEmpty: projectRows.length === 0, activeProject, projectDetailTasks, projectDetailEmpty: projectDetailTasks.length === 0,
      backToProjects: (e) => { e.preventDefault(); this.setState({ view: 'projects' }); },
      peopleFilterTabs, peopleRows, peopleEmpty: peopleRows.length === 0, activePerson,
      backToPeople: (e) => { e.preventDefault(); this.setState({ view: 'people' }); },
      waitingGroups, waitingEmpty: waitingGroups.length === 0,
      calendarDays, calendarWeekLabel,
      prevCalendarWeek: () => this.prevCalendarWeek(),
      nextCalendarWeek: () => this.nextCalendarWeek(),
      todayCalendarWeek: () => this.todayCalendarWeek(),
      filterProjectSelect: s.filterProject || 'all',
      onFilterProjectChange: (e) => this.setState({ filterProject: e.target.value }),
      projectFilterOptions: [{ id: 'inbox', name: '📥 Inbox (Sem projeto)' }, ...s.projects.map(p => ({ id: p.id, name: p.name }))],
      filterPersonSelect: s.filterPerson || 'all',
      onFilterPersonChange: (e) => this.setState({ filterPerson: e.target.value }),
      personFilterOptions: s.people.map(p => ({ id: p.id, name: p.name })),
      showShortcutsModal: s.showShortcutsModal,
      openShortcutsModal: () => this.setState({ showShortcutsModal: true }),
      closeShortcutsModal: () => this.setState({ showShortcutsModal: false }),
      hasSelectedTask: !!selectedTask, selectedTask, closeTask: () => this.closeTask(),
      projectOptions, peopleOptions, statusOptions: STATUS_OPTIONS,
      showNewModal: s.showNewModal, newTask,
      toasts: s.toasts || [],
      showNewProjectModal: s.showNewProjectModal,
      newProjectDraft: s.newProjectDraft,
      closeNewProjectModal: () => this.setState({showNewProjectModal: false}),
      submitNewProject: () => this.submitNewProject(),
      showNewPersonModal: s.showNewPersonModal,
      newPersonDraft: s.newPersonDraft,
      closeNewPersonModal: () => this.setState({showNewPersonModal: false}),
      submitNewPerson: () => this.submitNewPerson(),
      showEditUserModal: s.showEditUserModal, editUserNameDraft: s.editUserNameDraft,
      closeEditUserModal: () => this.setState({showEditUserModal: false}), submitEditUser: () => this.submitEditUser(),
      showEditProjectModal: s.showEditProjectModal, editProjectDraft: s.editProjectDraft,
      closeEditProjectModal: () => this.setState({showEditProjectModal: false}), submitEditProject: () => this.submitEditProject(),
      showEditPersonModal: s.showEditPersonModal, editPersonDraft: s.editPersonDraft,
      closeEditPersonModal: () => this.setState({showEditPersonModal: false}), submitEditPerson: () => this.submitEditPerson(),
      showConfirmModal: s.showConfirmModal, confirmPayload: s.confirmPayload,
      closeConfirmModal: () => this.setState({showConfirmModal: false}), confirmAction: () => this.confirmAction(),
      openNewTaskModal: () => this.setState({ showNewModal: true, newTaskDraft: this.emptyDraft() }),
      closeNewTaskModal: () => this.setState({ showNewModal: false }),
      submitNewTask: () => this.submitNewTaskInternal(),
      showBulkProjectModal: s.bulkModalType === 'project',
      showBulkPriorityModal: s.bulkModalType === 'priority',
      bulkSelectedProjectId: s.bulkSelectedProjectId,
      onBulkProjectChange: (e) => this.setState({ bulkSelectedProjectId: e.target.value }),
      applyBulkProject: () => this.applyBulkProject(),
      bulkSelectedPriority: s.bulkSelectedPriority,
      onBulkPriorityChange: (e) => this.setState({ bulkSelectedPriority: e.target.value }),
      applyBulkPriority: () => this.applyBulkPriority(),
      closeBulkModal: () => this.setState({ bulkModalType: null }),
      stopPropagation: (e) => e.stopPropagation()
    };
  }

  quickAddInternal() {
    const title = this.state.quickAddDraft.trim();
    if (!title) return;
    const id = 't' + Date.now();
    this.setState(s => ({
      tasks: [...s.tasks, {
        id, title, description: '', notes: '', tags: [], checklist: [], checklistDraft: '',
        projectId: null, priority: 'P3', status: 'TODO', dueDate: null, followUpDate: null,
        waitingFor: null, waitingReason: '', blockedBy: null, dependsOnTaskId: null, estimatedMinutes: null,
        createdAt: TODAY, updatedAt: TODAY, completedAt: null, parentTaskId: null,
        history: [h(TODAY, 'Tarefa criada')]
      }],
      quickAddDraft: ''
    }));
  }

  addInboxTaskInternal() {
    const title = this.state.inboxDraft.trim();
    if (!title) return;
    const id = 't' + Date.now();
    this.setState(s => ({
      tasks: [...s.tasks, {
        id, title, description: '', notes: '', tags: [], checklist: [], checklistDraft: '',
        projectId: null, priority: 'P3', status: 'INBOX', dueDate: null, followUpDate: null,
        waitingFor: null, waitingReason: '', blockedBy: null, dependsOnTaskId: null, estimatedMinutes: null,
        createdAt: TODAY, updatedAt: TODAY, completedAt: null, parentTaskId: null,
        history: [h(TODAY, 'Tarefa criada no Inbox')]
      }],
      inboxDraft: ''
    }));
  }

  submitNewTaskInternal() {
    const nt = this.state.newTaskDraft;
    const title = nt.title.trim();
    if (!title) return;
    const id = 't' + Date.now();
    this.setState(s => ({
      tasks: [...s.tasks, {
        id, title, description: nt.description, notes: '', tags: [], checklist: [], checklistDraft: '',
        projectId: nt.projectId || null, priority: nt.priority, status: nt.status,
        dueDate: nt.dueDate || null, followUpDate: null, waitingFor: nt.waitingFor || null, waitingReason: '',
        blockedBy: null, dependsOnTaskId: null, estimatedMinutes: null,
        createdAt: TODAY, updatedAt: TODAY, completedAt: null, parentTaskId: null,
        history: [h(TODAY, 'Tarefa criada')]
      }],
      showNewModal: false, newTaskDraft: this.emptyDraft()
    }));
  }
}