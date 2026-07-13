-- Keep debt_note_profiles.email aligned with auth.users after email changes.
create or replace function public.debt_note_ensure_profile(
  p_project_id uuid,
  p_display_name text default ''
)
returns public.debt_note_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_profile public.debt_note_profiles;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  insert into public.project_members (project_id, user_id, role, status)
  values (p_project_id, v_user_id, 'owner', 'active')
  on conflict (project_id, user_id) do nothing;

  insert into public.debt_note_profiles (id, project_id, email, display_name)
  values (
    v_user_id,
    p_project_id,
    coalesce(v_email, ''),
    coalesce(nullif(trim(p_display_name), ''), split_part(coalesce(v_email, 'user'), '@', 1))
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, debt_note_profiles.email),
    display_name = case
      when excluded.display_name <> '' then excluded.display_name
      else debt_note_profiles.display_name
    end,
    updated_at = now()
  returning * into v_profile;

  return v_profile;
end;
$$;
