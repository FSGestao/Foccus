"use client";

import { useEffect, useState } from "react";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { usePeopleStore } from "@/lib/stores/people-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { sortTasks } from "@/lib/tasks/sort";
import { relevantDateFor, isOverdueDate, dateLabelFor } from "@/lib/tasks/list-filters";
import { computeGargaloBreach, computeQuickWinCandidates } from "@/lib/assistant/compute";
import { useMarqueeSelection } from "@/lib/hooks/use-marquee-selection";
import { useDisplayName } from "@/lib/hooks/use-display-name";
import type { Priority, Task } from "@/lib/tasks/types";
import { TaskRow } from "./task-row";
import { TaskDetailPanel } from "./task-detail-panel";
import { BulkActionBar } from "./bulk-action-bar";
import { GargaloBanner } from "@/components/assistant/gargalo-banner";
import { QuickWinBanner } from "@/components/assistant/quick-win-banner";

type Tab = "all" | "today" | "done";
const TAB_DEFS: { key: Tab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "today", label: "Hoje" },
  { key: "done", label: "Concluídas" },
];

type QuickFilterKey = "filterP1" | "filterWaiting" | "filterBlocked" | "filterOverdue";
const QUICK_FILTER_DEFS: { key: QuickFilterKey; label: string }[] = [
  { key: "filterP1", label: "⚑ P1" },
  { key: "filterWaiting", label: "⏳ Aguardando" },
  { key: "filterBlocked", label: "⛔ Bloqueadas" },
  { key: "filterOverdue", label: "⚠️ Atrasadas" },
];

type GroupBy = "none" | "project" | "priority" | "due";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    cursor: "pointer",
    padding: "4px 10px",
    fontSize: 11.5,
    borderRadius: 20,
    fontWeight: 500,
    transition: "all .1s ease",
    border: `1px solid ${active ? "var(--pb-accent)" : "var(--pb-border)"}`,
    background: active ? "var(--pb-accent-bg)" : "var(--pb-surface)",
    color: active ? "var(--pb-accent)" : "var(--pb-text-dim)",
  };
}

function selectStyle(): React.CSSProperties {
  return {
    font: "inherit",
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--pb-text)",
    background: "var(--pb-glass)",
    border: "1px solid var(--pb-border)",
    borderRadius: 20,
    padding: "7px 14px",
    cursor: "pointer",
  };
}

export function TaskListPage() {
  const {
    tasks,
    loading,
    error,
    selectedTaskId,
    toast,
    init,
    quickAdd,
    updateTask,
    toggleDone,
    deleteTask,
    dismissToast,
    openTask,
    bulkUpdate,
    bulkDelete,
    showInfoToast,
  } = useTasksStore();

  const [quickTitle, setQuickTitle] = useState("");

  const projects = useProjectsStore((s) => s.projects);
  const initProjects = useProjectsStore((s) => s.init);
  const people = usePeopleStore((s) => s.people);
  const profile = useProfileStore();
  const { firstName: userFirstName } = useDisplayName();

  // Controles de visualização (Foccus.dc.html:1884-1893) — só desta tela, por
  // isso ficam em estado local em vez de num store compartilhado.
  const [tab, setTab] = useState<Tab>("all");
  const [filterP1, setFilterP1] = useState(false);
  const [filterWaiting, setFilterWaiting] = useState(false);
  const [filterBlocked, setFilterBlocked] = useState(false);
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [filterProject, setFilterProject] = useState("all");
  const [filterPerson, setFilterPerson] = useState("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  // Seleção múltipla (Foccus.dc.html:2148-2291) + checklist expansível na
  // linha (:2538-2543) — estado local, só existe na Minha Lista.
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [lastSelectedTaskId, setLastSelectedTaskId] = useState<string | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<string[]>([]);
  const { marqueeBox, justFinishedRef } = useMarqueeSelection(setSelectedTaskIds);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedTaskIds([]);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const quickFilterState: Record<QuickFilterKey, [boolean, (v: boolean) => void]> = {
    filterP1: [filterP1, setFilterP1],
    filterWaiting: [filterWaiting, setFilterWaiting],
    filterBlocked: [filterBlocked, setFilterBlocked],
    filterOverdue: [filterOverdue, setFilterOverdue],
  };

  useEffect(() => {
    init();
    initProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;
  const today = todayISO();
  const openTasks = tasks.filter((t) => t.status !== "CANCELLED" && t.status !== "DONE");

  // Cards de resumo (Foccus.dc.html:3120-3125) — clicáveis, cada um reseta os
  // pills e aplica seu próprio filtro/aba.
  function resetQuickFilters() {
    setFilterP1(false);
    setFilterWaiting(false);
    setFilterBlocked(false);
    setFilterOverdue(false);
  }
  const todayCount = openTasks.filter((t) => {
    const d = relevantDateFor(t);
    return !!d && d <= today;
  }).length;
  const overdueCount = openTasks.filter((t) => isOverdueDate(t, relevantDateFor(t))).length;
  const waitingCount = tasks.filter((t) => t.status === "WAITING").length;
  const upcomingCount = openTasks.filter((t) => {
    const d = relevantDateFor(t);
    return !!d && d > today;
  }).length;
  const summaryStats: { label: string; value: number; color: string; onClick: () => void }[] = [
    {
      label: "Hoje",
      value: todayCount,
      color: "var(--pb-accent)",
      onClick: () => {
        resetQuickFilters();
        setTab("today");
      },
    },
    {
      label: "Atrasadas",
      value: overdueCount,
      color: "var(--pb-red)",
      onClick: () => {
        resetQuickFilters();
        setFilterOverdue(true);
        setTab("all");
      },
    },
    {
      label: "Aguardando",
      value: waitingCount,
      color: "var(--pb-yellow)",
      onClick: () => {
        resetQuickFilters();
        setFilterWaiting(true);
        setTab("all");
      },
    },
    {
      label: "Próximas",
      value: upcomingCount,
      color: "var(--pb-blue)",
      onClick: () => {
        resetQuickFilters();
        setTab("all");
      },
    },
  ];

  // Pool da aba selecionada (Foccus.dc.html:3053-3062).
  let tabPool: Task[];
  if (tab === "today") {
    tabPool = openTasks.filter((t) => {
      const d = relevantDateFor(t);
      return !!d && d <= today;
    });
  } else if (tab === "done") {
    tabPool = tasks.filter((t) => t.status === "DONE");
  } else {
    tabPool = openTasks;
  }

  // Pills (filtro AND por cima da aba) + selects de Projeto/Pessoa.
  if (filterP1 || filterWaiting || filterBlocked || filterOverdue) {
    tabPool = tabPool.filter((t) => {
      if (filterP1 && t.priority !== "P1") return false;
      if (filterWaiting && t.status !== "WAITING") return false;
      if (filterBlocked && t.status !== "BLOCKED") return false;
      if (filterOverdue && !isOverdueDate(t, relevantDateFor(t))) return false;
      return true;
    });
  }
  if (filterProject !== "all") {
    tabPool = tabPool.filter((t) => (t.project_id ?? "inbox") === filterProject);
  }
  if (filterPerson !== "all") {
    tabPool = tabPool.filter((t) => t.waiting_for === filterPerson);
  }

  const sortedPool = sortTasks(tabPool);

  // Agrupamento (Foccus.dc.html:3086-3118).
  type Group = { label: string; rows: Task[] };
  let groups: Group[] = [];
  if (groupBy === "project") {
    const order: { id: string | null; label: string }[] = [
      { id: null, label: "Inbox" },
      ...projects.map((p) => ({ id: p.id, label: p.name })),
    ];
    groups = order
      .map((o) => ({ label: o.label, rows: sortedPool.filter((t) => (t.project_id ?? null) === o.id) }))
      .filter((g) => g.rows.length > 0);
  } else if (groupBy === "priority") {
    groups = (["P1", "P2", "P3", "P4"] as const)
      .map((p) => ({ label: p, rows: sortedPool.filter((t) => t.priority === p) }))
      .filter((g) => g.rows.length > 0);
  } else if (groupBy === "due") {
    const dateMap = new Map<string, Task[]>();
    const noDateRows: Task[] = [];
    sortedPool.forEach((t) => {
      const d = relevantDateFor(t);
      if (!d) {
        noDateRows.push(t);
      } else {
        if (!dateMap.has(d)) dateMap.set(d, []);
        dateMap.get(d)!.push(t);
      }
    });
    groups = [...dateMap.keys()].sort().map((d) => {
      const first = dateMap.get(d)![0];
      return { label: dateLabelFor(first, d) || d, rows: dateMap.get(d)! };
    });
    if (noDateRows.length > 0) groups.push({ label: "Sem prazo", rows: noDateRows });
  }

  // Ordem visível "achatada" (Foccus.dc.html: getCurrentVisibleTasks) — usada
  // só pro Shift+clique calcular o intervalo entre a última tarefa clicada e
  // a atual, seja a lista agrupada ou não.
  const flatVisibleIds = groupBy === "none" ? sortedPool.map((t) => t.id) : groups.flatMap((g) => g.rows.map((t) => t.id));

  function toggleSelect(taskId: string) {
    setSelectedTaskIds((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
    setLastSelectedTaskId(taskId);
  }

  function handleRowClick(taskId: string, e: React.MouseEvent) {
    if (justFinishedRef.current) return;

    if (e.shiftKey && lastSelectedTaskId) {
      const idx1 = flatVisibleIds.indexOf(lastSelectedTaskId);
      const idx2 = flatVisibleIds.indexOf(taskId);
      if (idx1 !== -1 && idx2 !== -1) {
        const start = Math.min(idx1, idx2);
        const end = Math.max(idx1, idx2);
        const range = flatVisibleIds.slice(start, end + 1);
        setSelectedTaskIds((prev) => Array.from(new Set([...prev, ...range])));
        setLastSelectedTaskId(taskId);
        return;
      }
    }

    if (e.ctrlKey || e.metaKey) {
      toggleSelect(taskId);
      return;
    }

    if (selectedTaskIds.length > 0) {
      toggleSelect(taskId);
      return;
    }

    openTask(taskId);
  }

  function toggleExpand(taskId: string) {
    setExpandedTaskIds((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
  }

  function toggleSubtask(task: Task, itemId: string) {
    const next = (task.checklist ?? []).map((c) => (c.id === itemId ? { ...c, done: !c.done } : c));
    updateTask(task.id, { checklist: next });
  }

  // Ações em massa (Foccus.dc.html: applyBulkProjectValue/applyBulkPriorityValue/
  // applyBulkComplete/applyBulkDelete) — reaproveitam bulkUpdate/bulkDelete do
  // store, que por sua vez reaproveitam updateTask/deleteTask por id.
  function bulkAssignProject(projectId: string | null) {
    if (!selectedTaskIds.length) return;
    const project = projects.find((p) => p.id === projectId);
    const projName = project ? project.name : "Inbox (sem projeto)";
    const count = selectedTaskIds.length;
    bulkUpdate(selectedTaskIds, { project_id: projectId }, `Projeto alterado em lote para ${projName}`).then(() => {
      showInfoToast(`Projeto "${projName}" atribuído a ${count} tarefa(s)!`);
    });
    setSelectedTaskIds([]);
  }

  function bulkSetPriority(priority: Priority) {
    if (!selectedTaskIds.length) return;
    const count = selectedTaskIds.length;
    bulkUpdate(selectedTaskIds, { priority }, `Prioridade alterada em lote para ${priority}`).then(() => {
      showInfoToast(`Prioridade ${priority} definida para ${count} tarefa(s)!`);
    });
    setSelectedTaskIds([]);
  }

  function bulkComplete() {
    if (!selectedTaskIds.length) return;
    bulkUpdate(selectedTaskIds, { status: "DONE", completed_at: new Date().toISOString() }, "Concluída em lote");
    setSelectedTaskIds([]);
  }

  function bulkDeleteSelected() {
    if (!selectedTaskIds.length) return;
    bulkDelete(selectedTaskIds);
    setSelectedTaskIds([]);
  }

  // Assistente (Foccus.dc.html:2980-2997): banners exibidos na Minha Lista,
  // tela de entrada do sistema. Gargalo tem prioridade sobre Vitórias
  // Rápidas — os dois nunca aparecem juntos.
  const { count: emProgressoCount, breach: gargaloBreach } = computeGargaloBreach(
    tasks,
    profile.asstGargaloAtivo,
    profile.asstGargaloLimite,
  );
  const showGargaloBanner = profile.loaded && gargaloBreach && profile.assistantBannerDismissedDate !== today;
  const quickWinCandidates = computeQuickWinCandidates(tasks);
  const showQuickWinBanner =
    profile.loaded &&
    !showGargaloBanner &&
    profile.asstQuickwinAtivo &&
    profile.quickWinBannerActive &&
    quickWinCandidates.length > 0 &&
    profile.quickWinDismissedDate !== today;

  function handleQuickAddSubmit() {
    if (!quickTitle.trim()) return;
    quickAdd(quickTitle);
    setQuickTitle("");
  }

  function renderRow(task: Task) {
    return (
      <TaskRow
        key={task.id}
        task={task}
        isSelected={selectedTaskIds.includes(task.id)}
        isExpanded={expandedTaskIds.includes(task.id)}
        onRowClick={(e) => handleRowClick(task.id, e)}
        onToggleExpand={() => toggleExpand(task.id)}
        onToggleDone={() => toggleDone(task.id)}
        onChangePriority={(priority) => updateTask(task.id, { priority })}
        onChangeDate={(date) =>
          updateTask(task.id, task.status === "WAITING" ? { follow_up_date: date } : { due_date: date })
        }
        onDelete={() => deleteTask(task.id)}
        onToggleSubtask={(itemId) => toggleSubtask(task, itemId)}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-8">
      {showGargaloBanner && <GargaloBanner emProgressoCount={emProgressoCount} />}
      {showQuickWinBanner && <QuickWinBanner candidates={quickWinCandidates} />}

      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
            Lista de {userFirstName}
          </h1>
          <div className="mt-0.5 text-xs" style={{ color: "var(--pb-text-muted)" }}>
            Visualização operacional de tarefas e compromissos
          </div>
        </div>

        <div className="flex items-stretch overflow-hidden rounded-lg" style={{ background: "var(--pb-glass)", border: "1px solid var(--pb-border)" }}>
          {summaryStats.map((stat, i) => (
            <button
              key={stat.label}
              type="button"
              onClick={stat.onClick}
              title={`Filtrar por ${stat.label}`}
              className="flex min-w-[68px] flex-col items-center px-3.5 py-1.5"
              style={{ borderRight: i < summaryStats.length - 1 ? "1px solid var(--pb-border)" : undefined }}
            >
              <span className="text-base font-bold leading-tight" style={{ color: stat.color }}>
                {stat.value}
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
                {stat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-full p-1" style={{ background: "var(--pb-glass)", border: "1px solid var(--pb-border)" }}>
          {TAB_DEFS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{
                  color: active ? "var(--pb-on-accent)" : "var(--pb-text-muted)",
                  background: active ? "var(--pb-accent)" : "transparent",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[11.5px] font-medium" style={{ color: "var(--pb-text-dim)" }}>
            Agrupar:
          </label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} title="Agrupar visualização da lista" style={selectStyle()}>
            <option value="none">Nenhum</option>
            <option value="project">Projeto</option>
            <option value="priority">Urgência</option>
            <option value="due">Prazo</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {QUICK_FILTER_DEFS.map((qf) => {
            const [active, setActive] = quickFilterState[qf.key];
            return (
              <button key={qf.key} type="button" onClick={() => setActive(!active)} title={`Filtro rápido: ${qf.label}`} style={pillStyle(active)}>
                {qf.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} title="Filtrar tarefas por Projeto" style={selectStyle()}>
            <option value="all">📁 Todos os Projetos</option>
            <option value="inbox">📥 Inbox</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} title="Filtrar tarefas por Responsável" style={selectStyle()}>
            <option value="all">👤 Todas as Pessoas</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAddSubmit();
          }}
          placeholder="Criar tarefa rápida e pressionar Enter..."
          className="w-full rounded-md py-2 pl-8 pr-3 text-sm"
          style={{
            background: "var(--pb-glass)",
            border: "1px dashed var(--pb-border-hover)",
            color: "var(--pb-text)",
          }}
        />
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base" style={{ color: "var(--pb-text-dim)" }}>
          +
        </span>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--pb-red)" }}>
          {error}
        </p>
      )}

      {loading && (
        <p className="p-4 text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Carregando...
        </p>
      )}

      {!loading && groupBy === "none" && (
        <div className="flex flex-col gap-2">
          {sortedPool.length === 0 && (
            <p className="p-9 text-center text-sm" style={{ color: "var(--pb-text-muted)" }}>
              Nenhuma tarefa encontrada neste filtro.
            </p>
          )}
          {sortedPool.map(renderRow)}
        </div>
      )}

      {!loading && groupBy !== "none" && (
        <div className="flex flex-col gap-1">
          {groups.length === 0 && (
            <p className="p-9 text-center text-sm" style={{ color: "var(--pb-text-muted)" }}>
              Nenhuma tarefa encontrada neste filtro.
            </p>
          )}
          {groups.map((g) => (
            <div key={g.label} className="flex flex-col gap-2">
              <div className="mt-3 mb-1 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--pb-text-dim)" }}>
                  {g.label}
                </span>
                <div className="h-px flex-1" style={{ background: "var(--pb-border)" }} />
              </div>
              <div className="mb-3.5 flex flex-col gap-2">{g.rows.map(renderRow)}</div>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => openTask(null)}
          onChange={(patch, note) => updateTask(selectedTask.id, patch, note)}
          onDelete={() => {
            deleteTask(selectedTask.id);
            openTask(null);
          }}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-md px-4 py-2.5 text-sm shadow-lg"
          style={{ background: "var(--pb-accent)", color: "var(--pb-on-accent)" }}
        >
          <span>{toast.message}</span>
          {toast.onUndo && (
            <button type="button" onClick={toast.onUndo} className="font-medium underline">
              Desfazer
            </button>
          )}
          <button type="button" onClick={dismissToast} className="opacity-80">
            ✕
          </button>
        </div>
      )}

      {selectedTaskIds.length > 0 && (
        <BulkActionBar
          count={selectedTaskIds.length}
          projects={projects}
          onClear={() => setSelectedTaskIds([])}
          onAssignProject={bulkAssignProject}
          onSetPriority={bulkSetPriority}
          onComplete={bulkComplete}
          onDelete={bulkDeleteSelected}
        />
      )}

      {marqueeBox.active && (
        <div
          className="pointer-events-none fixed rounded"
          style={{
            left: marqueeBox.left,
            top: marqueeBox.top,
            width: marqueeBox.width,
            height: marqueeBox.height,
            border: "1.5px dashed var(--pb-accent)",
            background: "rgba(14,154,167,0.15)",
            zIndex: 9999,
          }}
        />
      )}
    </div>
  );
}
