-- LearnLOOM Phase 1: accounts, classes, attempts, answer history.
-- Access is enforced here with Row Level Security; the browser only holds the public anon key.
-- Students see only their own rows; teachers see only students enrolled in classes they own.


-- Settings the browser must never read (teacher sign-up code).
create schema if not exists private;
revoke all on schema private from public;
create table if not exists private.settings (
  key text primary key,
  value text not null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 40),
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (classroom_id, student_id)
);

-- One row per run through an episode. Ids are generated on the device so offline retries are idempotent.
create table public.attempts (
  id uuid primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  episode text not null,
  number int not null check (number >= 1),
  started_at timestamptz not null,
  finished_at timestamptz,
  unique (user_id, episode, number)
);

-- Append-only answer log. Id is deterministic per (attempt, kind, item, value) so re-sending is a no-op.
create table public.answer_events (
  id text primary key check (char_length(id) between 8 and 80),
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  concept text,
  item_id text not null,
  kind text not null check (kind in ('main', 'reason', 'diagnosis', 'practice', 'practice_retry', 'recheck', 'recheck_b', 'checkpoint', 'checkpoint_reason', 'transfer')),
  value text not null,
  correct boolean,
  recorded_at timestamptz not null,
  received_at timestamptz not null default now()
);
create index answer_events_attempt on public.answer_events (attempt_id, recorded_at);

-- Latest computed status per concept per attempt (route, outcome). Answers themselves live in answer_events.
create table public.concept_results (
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  concept text not null,
  outcome text not null,
  path text,
  detail jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (attempt_id, concept)
);

-- Device state for "resume where you left off" on any device (one row per learner per episode).
create table public.progress_snapshots (
  user_id uuid not null references public.profiles (id) on delete cascade,
  episode text not null,
  data jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, episode)
);

-- Helpers run as owner so policies can look across tables without recursive RLS.
create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
$$;

create or replace function public.teaches(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from enrollments e join classrooms c on c.id = e.classroom_id
    where e.student_id = student and c.teacher_id = auth.uid()
  )
$$;

create or replace function public.owns_class(classroom uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from classrooms where id = classroom and teacher_id = auth.uid())
$$;

create or replace function public.enrolled_in(classroom uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from enrollments where classroom_id = classroom and student_id = auth.uid())
$$;

create or replace function public.owns_attempt(attempt uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from attempts where id = attempt and user_id = auth.uid())
$$;

-- Teacher role needs the code stored in private.settings; students cannot self-promote.
-- First-run setup: while no code is stored yet, the first person to claim sets it (at least 6 characters),
-- so the owner never has to edit SQL. Later teachers must type that same code.
create or replace function public.claim_teacher(code text) returns boolean
language plpgsql security definer set search_path = public, private as $$
declare expected text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if code is null or char_length(btrim(code)) < 6 then return false; end if;
  select value into expected from private.settings where key = 'teacher_code';
  if expected is null then
    insert into private.settings (key, value) values ('teacher_code', btrim(code)) on conflict (key) do nothing;
    select value into expected from private.settings where key = 'teacher_code';
  end if;
  if btrim(code) <> expected then return false; end if;
  update profiles set role = 'teacher' where id = auth.uid();
  return found;
end $$;

-- Lets the sign-in screen confirm a class code before a student account is made. Reveals only the class name.
create or replace function public.class_name(code text) returns text
language sql stable security definer set search_path = public as $$
  select name from classrooms where join_code = upper(btrim(code))
$$;

create or replace function public.join_class(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from profiles where id = auth.uid() and role = 'student') then
    raise exception 'students only';
  end if;
  select id into cid from classrooms where join_code = upper(btrim(code));
  if cid is null then return null; end if;
  insert into enrollments (classroom_id, student_id) values (cid, auth.uid()) on conflict do nothing;
  return cid;
end $$;

-- Teachers may not change the generated code or move classes to someone else.
create or replace function public.new_join_code() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.join_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  else
    new.join_code := old.join_code;
    new.teacher_id := old.teacher_id;
  end if;
  return new;
end $$;
create trigger classrooms_join_code before insert or update on public.classrooms
  for each row execute function public.new_join_code();

alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.enrollments enable row level security;
alter table public.attempts enable row level security;
alter table public.answer_events enable row level security;
alter table public.concept_results enable row level security;
alter table public.progress_snapshots enable row level security;

-- profiles
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.teaches(id));
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid() and role = 'student');
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Role column cannot be written by the client at all (claim_teacher runs as owner).
revoke update on public.profiles from authenticated;
grant update (nickname) on public.profiles to authenticated;

-- classrooms
create policy classrooms_read on public.classrooms for select to authenticated
  using (teacher_id = auth.uid() or public.enrolled_in(id));
create policy classrooms_insert on public.classrooms for insert to authenticated
  with check (teacher_id = auth.uid() and public.is_teacher());
create policy classrooms_update on public.classrooms for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy classrooms_delete on public.classrooms for delete to authenticated
  using (teacher_id = auth.uid());

-- enrollments (joining goes through join_class)
create policy enrollments_read on public.enrollments for select to authenticated
  using (student_id = auth.uid() or public.owns_class(classroom_id));
create policy enrollments_leave on public.enrollments for delete to authenticated
  using (student_id = auth.uid() or public.owns_class(classroom_id));

-- attempts: learners write their own; finished_at may be set, nothing else changes.
create policy attempts_read on public.attempts for select to authenticated
  using (user_id = auth.uid() or public.teaches(user_id));
create policy attempts_insert on public.attempts for insert to authenticated
  with check (user_id = auth.uid());
create policy attempts_update on public.attempts for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.attempts from authenticated;
grant update (finished_at) on public.attempts to authenticated;

-- answer_events: insert-only history, never updated or deleted by clients.
create policy answer_events_read on public.answer_events for select to authenticated
  using (user_id = auth.uid() or public.teaches(user_id));
create policy answer_events_insert on public.answer_events for insert to authenticated
  with check (user_id = auth.uid() and public.owns_attempt(attempt_id));

-- concept_results
create policy concept_results_read on public.concept_results for select to authenticated
  using (user_id = auth.uid() or public.teaches(user_id));
create policy concept_results_insert on public.concept_results for insert to authenticated
  with check (user_id = auth.uid() and public.owns_attempt(attempt_id));
create policy concept_results_update on public.concept_results for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.owns_attempt(attempt_id));

-- progress_snapshots: private to the learner.
create policy snapshots_read on public.progress_snapshots for select to authenticated
  using (user_id = auth.uid());
create policy snapshots_insert on public.progress_snapshots for insert to authenticated
  with check (user_id = auth.uid());
create policy snapshots_update on public.progress_snapshots for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on all tables in schema public from anon;
revoke execute on function public.claim_teacher(text), public.join_class(text), public.class_name(text) from public, anon;
grant execute on function public.class_name(text) to anon, authenticated;
grant execute on function public.claim_teacher(text), public.join_class(text) to authenticated;
