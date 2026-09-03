"use client";

import { useEffect, useMemo, useState } from "react";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { useProjectsStore } from "@/lib/stores/projects-store";
import { KpiBar } from "@/components/dashboard/kpi-bar";
import { DashboardKanban } from "@/components/dashboard/dashboard-kanban";
import { DashboardGantt } from "@/components/dashboard/dashboard-gantt";
import { DashboardBurndown } from "@/components/dashboard/dashboard-burndown";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";

type Mode = "kanban" | "gantt" | "burndown" | "overview";
const MODE_TABS: { key: Mode; label: string }[] = [
  { key: "kanban", label: "Kanban" },
  { key: "gantt", label: "Gantt" },
  { key: "burndown", label: "Burndown" },
  { key: "overview", label: "Visão Geral" },
];

// "Painel do Projeto" (Foccus.dc.html: viewDashboard) — identidade visual
// própria (--db-*), 4 sub-modos. Fórmulas em src/lib/dashboard/compute.ts.
export default function DashboardPage() {
  const { tasks, selectedTaskId, init, updateTask, deleteTask, openTask } = useTasksStore();
  const { projects, init: initProjects } = useProjectsStore();
  const [projectFilter, setProjectFilter] = useState("all");
  const [mode, setMode] = useState<Mode>("kanban");

  useEffect(() => {
    init();
    initProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scopeTasks = useMemo(() => {
    const base = tasks.filter((t) => t.status !== "CANCELLED");
    if (projectFilter === "all") return base;
    if (projectFilter === "inbox") return base.filter((t) => !t.project_id);
    return base.filter((t) => t.project_id === projectFilter);
  }, [tasks, projectFilter]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="db-scope" style={{ background: "var(--db-bg)", minHeight: "100%" }}>
      <div style={{ backgroundImage: "var(--db-bg-gradient)" }}>
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold"
              style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)", color: "var(--db-text)" }}
            >
              <option value="all">Todos os Projetos</option>
              <option value="inbox">Inbox (Sem Projeto)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="text-center">
              <h1 className="text-lg font-bold" style={{ color: "var(--db-text)" }}>
                Painel do Projeto
              </h1>
              <div className="text-xs" style={{ color: "var(--db-text-muted)" }}>
                Kanban, Gantt e Burndown num só lugar
              </div>
            </div>

            <div style={{ width: 1 }} />
          </div>

          <KpiBar scopeTasks={scopeTasks} />

          <div
            className="inline-flex w-fit gap-1 rounded-full p-1"
            style={{ background: "var(--db-panel)", border: "1px solid var(--db-border)" }}
          >
            {MODE_TABS.map((tab) => {
              const active = mode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMode(tab.key)}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold"
                  style={{
                    background: active ? "var(--db-teal)" : "transparent",
                    color: active ? "#fff" : "var(--db-text-muted)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {mode === "kanban" && <DashboardKanban scopeTasks={scopeTasks} onOpenTask={openTask} />}
          {mode === "gantt" && <DashboardGantt scopeTasks={scopeTasks} projects={projects} filterMode={projectFilter} />}
          {mode === "burndown" && <DashboardBurndown scopeTasks={scopeTasks} />}
          {mode === "overview" && (
            <DashboardOverview allTasks={tasks} projects={projects} scopeTasksForVelocity={scopeTasks} />
          )}
        </div>
      </div>

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
    </div>
  );
}
