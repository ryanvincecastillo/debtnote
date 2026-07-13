-- Full DebtNote account wipe for the calling user (Play Store / privacy deletion).
-- Does not delete auth.users here — the app/edge layer deletes Auth only when
-- the user has no remaining project_members (shared Supabase tenancy).

create or replace function public.debt_note_delete_account(p_project_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_other_memberships int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_project_member(p_project_id) then
    raise exception 'Not a project member';
  end if;

  -- Child rows cascade from records / pools where FKs allow it.
  delete from public.debt_note_reminders
  where owner_user_id = v_user_id and project_id = p_project_id;

  delete from public.debt_note_proof_submissions
  where owner_user_id = v_user_id and project_id = p_project_id;

  delete from public.debt_note_agreements
  where owner_user_id = v_user_id and project_id = p_project_id;

  delete from public.debt_note_payments
  where owner_user_id = v_user_id and project_id = p_project_id;

  delete from public.debt_note_installments
  where owner_user_id = v_user_id and project_id = p_project_id;

  delete from public.debt_note_records
  where owner_user_id = v_user_id and project_id = p_project_id;

  delete from public.debt_note_paluwagan_members
  where owner_user_id = v_user_id and project_id = p_project_id;

  delete from public.debt_note_paluwagan_pools
  where owner_user_id = v_user_id and project_id = p_project_id;

  delete from public.debt_note_contacts
  where owner_user_id = v_user_id and project_id = p_project_id;

  delete from public.debt_note_profiles
  where id = v_user_id and project_id = p_project_id;

  delete from public.project_members
  where user_id = v_user_id and project_id = p_project_id;

  select count(*)::int into v_other_memberships
  from public.project_members
  where user_id = v_user_id;

  return jsonb_build_object(
    'ok', true,
    'user_id', v_user_id,
    'delete_auth', v_other_memberships = 0
  );
end;
$$;

grant execute on function public.debt_note_delete_account(uuid) to authenticated;

-- Allow owners to remove their own proof objects (folder = auth uid).
drop policy if exists debt_note_proofs_delete on storage.objects;
create policy debt_note_proofs_delete on storage.objects for delete
using (bucket_id = 'debt-note-proofs' and auth.uid()::text = (storage.foldername(name))[1]);
