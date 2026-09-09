import type { Person } from "./types";

// Ordem alfabética pelo nome (pedido do usuário, 2026-09-09) — dropdowns de
// "Aguardando quem" e o filtro de pessoas da Minha Lista consomem `people`
// direto da store, então ordenar aqui já resolve os dois lugares de uma vez.
export function sortPeopleByName(people: Person[]): Person[] {
  return [...people].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
