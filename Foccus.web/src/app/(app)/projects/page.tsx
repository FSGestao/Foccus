"use client";

import { useEffect, useState } from "react";
import { useProjectsStore } from "@/lib/stores/projects-store";
import type { Project } from "@/lib/projects/types";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectModal } from "@/components/projects/project-modal";

export default function ProjectsPage() {
  const { projects, loading, error, init, createProject, updateProject, deleteProject } =
    useProjectsStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDelete(project: Project) {
    // window.confirm mesmo (sem modal próprio) — igual ao Foccus_Template em
    // alguns fluxos, ver DOCUMENTACAO_TECNICA.md seção 13.
    if (window.confirm(`Excluir o projeto "${project.name}"? As tarefas dele voltam pra Inbox.`)) {
      deleteProject(project.id);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
          Projetos
        </h1>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="rounded-md px-3 py-1.5 text-sm font-medium"
          style={{ background: "var(--pb-accent)", color: "var(--pb-on-accent)" }}
        >
          + Novo projeto
        </button>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--pb-red)" }}>
          {error}
        </p>
      )}

      {loading && (
        <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Carregando...
        </p>
      )}
      {!loading && projects.length === 0 && (
        <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Nenhum projeto ainda.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={() => setEditingProject(project)}
            onDelete={() => handleDelete(project)}
          />
        ))}
      </div>

      {showNewModal && (
        <ProjectModal
          onClose={() => setShowNewModal(false)}
          onSubmit={(patch) => createProject(patch)}
        />
      )}

      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={(patch) => updateProject(editingProject.id, patch)}
        />
      )}
    </div>
  );
}
