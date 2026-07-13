-- Creditor-only guest agreement payload: include lender payment details for non-techie debtors.
create or replace function public.debt_note_get_agreement_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
begin
  select
    a.*,
    r.title as record_title,
    r.principal,
    r.balance,
    r.direction,
    p.gcash_number,
    p.maya_number,
    p.display_name as lender_name
  into v_row
  from public.debt_note_agreements a
  join public.debt_note_records r on r.id = a.record_id
  left join public.debt_note_profiles p on p.id = a.owner_user_id
  where a.public_token = p_token
    and (a.expires_at is null or a.expires_at > now());

  if not found then return null; end if;

  return jsonb_build_object(
    'id', v_row.id,
    'borrower_name', v_row.borrower_name,
    'borrower_email', v_row.borrower_email,
    'terms_json', v_row.terms_json,
    'signature_data', v_row.signature_data,
    'signed_at', v_row.signed_at,
    'record_title', v_row.record_title,
    'principal', v_row.principal,
    'balance', v_row.balance,
    'direction', v_row.direction,
    'gcash_number', v_row.gcash_number,
    'maya_number', v_row.maya_number,
    'lender_name', v_row.lender_name
  );
end;
$$;

grant execute on function public.debt_note_get_agreement_by_token(text) to anon, authenticated;
