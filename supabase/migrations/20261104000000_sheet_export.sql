-- LearnLOOM: read-only export for the auto-updating Google Sheet (docs/fake-hero/google-sheets-auto.md).
-- The sheet calls sheet_export(token) with the public anon key plus a separate export key.
-- No service_role key is needed, and the function can only read; it never changes data.
-- Only the key's SHA-256 is stored, so the key cannot be read back from the database.
-- Running this whole file again makes a new key, and the old one stops working.

create or replace function public.sheet_export(token text) returns jsonb
language plpgsql stable security definer set search_path = public, private as $$
declare expected text;
begin
  select value into expected from private.settings where key = 'export_key_sha256';
  if expected is null or token is null or char_length(token) < 32
     or encode(sha256(convert_to(token, 'UTF8')), 'hex') <> expected then
    raise exception 'invalid export key' using errcode = '28000';
  end if;
  return (
    with students as (
      select p.id, p.nickname, p.created_at,
        coalesce((select string_agg(c.name, ', ' order by c.name)
          from enrollments e join classrooms c on c.id = e.classroom_id where e.student_id = p.id), '') as classroom
      from profiles p where p.role = 'student'
    )
    select jsonb_build_object(
      'generated_at', now(),
      'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'nickname', s.nickname, 'classroom', s.classroom, 'created_at', s.created_at)
        order by s.classroom, s.nickname) from students s), '[]'::jsonb),
      'attempts', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'user_id', a.user_id, 'episode', a.episode, 'number', a.number,
        'started_at', a.started_at, 'finished_at', a.finished_at) order by a.user_id, a.number)
        from attempts a join students s on s.id = a.user_id), '[]'::jsonb),
      'concepts', coalesce((select jsonb_agg(jsonb_build_object('attempt_id', r.attempt_id, 'user_id', r.user_id, 'concept', r.concept,
        'outcome', r.outcome, 'path', r.path, 'detail', r.detail, 'updated_at', r.updated_at) order by r.attempt_id, r.concept)
        from concept_results r join students s on s.id = r.user_id), '[]'::jsonb),
      -- same order the teacher dashboard reads them in, so "latest answer per item" matches
      'events', coalesce((select jsonb_agg(jsonb_build_object('attempt_id', e.attempt_id, 'user_id', e.user_id, 'concept', e.concept,
        'item_id', e.item_id, 'kind', e.kind, 'value', e.value, 'correct', e.correct, 'recorded_at', e.recorded_at)
        order by e.recorded_at, e.received_at) from answer_events e join students s on s.id = e.user_id), '[]'::jsonb)
    )
  );
end $$;

revoke execute on function public.sheet_export(text) from public, authenticated;
grant execute on function public.sheet_export(text) to anon;

-- New export key: shown once in the result below. Copy it into the sheet's Script properties as EXPORT_KEY.
with k as (select replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '') as export_key),
saved as (
  insert into private.settings (key, value)
  select 'export_key_sha256', encode(sha256(convert_to(export_key, 'UTF8')), 'hex') from k
  on conflict (key) do update set value = excluded.value
  returning 1
)
select export_key from k, saved;
