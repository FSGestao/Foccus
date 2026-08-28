-- RLS — cada linha só é visível/editável por quem é dono dela (auth.uid() = user_id).
-- profiles usa `id` (é o próprio id do usuário), as demais usam `user_id`.

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.people enable row level security;
alter table public.tasks enable row level security;
alter table public.project_notes enable row level security;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- Sem policy de insert/delete em profiles pro usuário comum: a linha é criada pelo
-- admin (via service-role, que ignora RLS) no momento do provisionamento.

create policy "projects_select_own" on public.projects for select using (user_id = auth.uid());
create policy "projects_insert_own" on public.projects for insert with check (user_id = auth.uid());
create policy "projects_update_own" on public.projects for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "projects_delete_own" on public.projects for delete using (user_id = auth.uid());

create policy "people_select_own" on public.people for select using (user_id = auth.uid());
create policy "people_insert_own" on public.people for insert with check (user_id = auth.uid());
create policy "people_update_own" on public.people for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "people_delete_own" on public.people for delete using (user_id = auth.uid());

create policy "tasks_select_own" on public.tasks for select using (user_id = auth.uid());
create policy "tasks_insert_own" on public.tasks for insert with check (user_id = auth.uid());
create policy "tasks_update_own" on public.tasks for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks_delete_own" on public.tasks for delete using (user_id = auth.uid());

create policy "project_notes_select_own" on public.project_notes for select using (user_id = auth.uid());
create policy "project_notes_insert_own" on public.project_notes for insert with check (user_id = auth.uid());
create policy "project_notes_update_own" on public.project_notes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "project_notes_delete_own" on public.project_notes for delete using (user_id = auth.uid());
