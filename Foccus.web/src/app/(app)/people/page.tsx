"use client";

import { useEffect, useState } from "react";
import { usePeopleStore } from "@/lib/stores/people-store";
import type { Person } from "@/lib/people/types";
import { PersonCard } from "@/components/people/person-card";
import { PersonModal } from "@/components/people/person-modal";

export default function PeoplePage() {
  const { people, loading, error, init, createPerson, updatePerson, togglePersonStatus, deletePerson } =
    usePeopleStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDelete(person: Person) {
    if (window.confirm(`Excluir "${person.name}"? Tarefas que aguardavam essa pessoa ficam sem responsável.`)) {
      deletePerson(person.id);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--pb-text)" }}>
          Pessoas
        </h1>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="rounded-md px-3 py-1.5 text-sm font-medium"
          style={{ background: "var(--pb-accent)", color: "var(--pb-on-accent)" }}
        >
          + Nova pessoa
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
      {!loading && people.length === 0 && (
        <p className="text-sm" style={{ color: "var(--pb-text-muted)" }}>
          Nenhuma pessoa cadastrada ainda.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {people.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            onEdit={() => setEditingPerson(person)}
            onToggleStatus={() => togglePersonStatus(person.id)}
            onDelete={() => handleDelete(person)}
          />
        ))}
      </div>

      {showNewModal && (
        <PersonModal onClose={() => setShowNewModal(false)} onSubmit={(patch) => createPerson(patch)} />
      )}

      {editingPerson && (
        <PersonModal
          person={editingPerson}
          onClose={() => setEditingPerson(null)}
          onSubmit={(patch) => updatePerson(editingPerson.id, patch)}
        />
      )}
    </div>
  );
}
