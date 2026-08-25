<script type="text/x-dc" data-dc-script>
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
    { id: 'claudio', name: 'Claudi