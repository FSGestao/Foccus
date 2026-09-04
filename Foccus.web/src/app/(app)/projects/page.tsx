"use client";

import { useEffect, useState } from "react";
import { useProjectsStore } from "@/lib/stores/projects-store";
import type { Project } from "@/lib/projects/types";
import { PROJECT_FILTER_TABS, type ProjectFilter } from "@/lib/projects/constants";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectModal } from "@/components/projects/project-modal";
import { AssistantBanners } from "@/components/assistant/assistant-banners";

export default function ProjectsPage() {
  const { projects, loading, error, init, createProject, updateProject, deleteProject } =
    useProjectsStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<ProjectFilter>("all");

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDelete(project: Project) {
    // window.confirm mesmo (sem modal próprio) — igual ao Foccus_Template em
    // alguns fluxos, ver DOCUMENTACAO_TECNICA.md seção 13.
    if (window.confirm(`Excluir o projeto "${project.name}"? As tarefas dele voltam pra Inbox.`)) {
      deleteProject(project.id);
      setEditingProject(null);
    }
  }

  const filteredProjects = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-8">
      <AssistantBanners />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
            Projetos
          </h1>
          <div className="mt-0.5 text-[12.5px]" style={{ color: "var(--pb-text-muted)" }}>
            Acompanhe o andamento dos projetos ativos
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          title="Criar um Novo Projeto"
          className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium"
          style={{ background: "var(--pb-accent)", color: "#fff" }}
        >
          + Novo Projeto
        </button>
      </div>

      <div
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full p-1"
        style={{
          background: "var(--pb-glass)",
          backdropFilter: "blur(10px) saturate(150%)",
          WebkitBackdropFilter: "blur(10px) saturate(150%)",
          border: "1px solid var(--pb-border)",
        }}
      >
        {PROJECT_FILTER_TABS.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              title={`Filtrar projetos: ${tab.label}`}
              className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-all"
              style={{
                border: `1px solid ${active ? "var(--pb-accent)" : "transparent"}`,
                background: active ? "var(--pb-accent)" : "transparent",
                color: active ? "var(--pb-on-accent)" : "var(--pb-text-muted)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
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
      {!loading && filteredProjects.length === 0 && (
        <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Nenhum projeto por aqui.
        </p>
      )}

      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {filteredProjects.map((project) => (
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
          onDelete={() => handleDelete(editingProject)}
        />
      )}
    </div>
  );
}
