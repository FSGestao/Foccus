"use client";

import { useEffect, useMemo } from "react";
import { useTasksStore } from "@/lib/stores/tasks-store";
import { usePeopleStore } from "@/lib/stores/people-store";
import { useDisplayName } from "@/lib/hooks/use-display-name";
import type { Comment } from "@/lib/tasks/types";
import { WaitingCard } from "@/components/waiting/waiting-card";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";

// Aguardando (Foccus.dc.html: viewWaiting) — tarefas com status WAITING,
// agrupadas por pessoa.
export default function WaitingPage() {
  const { tasks, selectedTaskId, init, updateTask, deleteTask, openTask } = useTasksStore();
  const { people, init: initPeople } = usePeopleStore();
  const { fullName: authorLabel } = useDisplayName();

  useEffect(() => {
    init();
    initPeople();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const waitingTasks = tasks.filter((t) => t.status === "WAITING");

  const groups = useMemo(() => {
    const byPerson = new Map<string, typeof waitingTasks>();
    for (const task of waitingTasks) {
      const key = task.waiting_for ?? "none";
      byPerson.set(key, [...(byPerson.get(key) ?? []), task]);
    }
    return Array.from(byPerson.entries()).map(([personId, list]) => ({
      personId,
      label: personId === "none" ? "Sem responsável definido" : people.find((p) => p.id === personId)?.name ?? "—",
      tasks: list,
    }));
  }, [waitingTasks, people]);

  function addComment(taskId: string, text: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const comment: Comment = {
      id: crypto.randomUUID(),
      author: authorLabel,
      date: new Date().toISOString(),
      text,
    };
    updateTask(taskId, { comments: [...(task.comments ?? []), comment] });
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
        Aguardando
      </h1>

      {waitingTasks.length === 0 && (
        <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Nenhuma tarefa aguardando alguém no momento.
        </p>
      )}

      {groups.map((group) => (
        <div key={group.personId} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold" style={{ color: "var(--pb-text-muted)" }}>
            {group.label}
          </h2>
          <div className="flex flex-col gap-2">
            {group.tasks.map((task) => (
              <WaitingCard
                key={task.id}
                task={task}
                authorLabel={authorLabel}
                onAddComment={(text) => addComment(task.id, text)}
                onOpen={() => openTask(task.id)}
              />
            ))}
          </div>
        </div>
      ))}

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
