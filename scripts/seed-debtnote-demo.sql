-- Idempotent demo seed for ryanvincecastillo@gmail.com on debtnote-dev.
-- Safe to re-run: deletes prior [Demo]-marked rows for this owner first.
-- Prerequisite: user must exist in auth.users (sign in via OTP at least once).

do $$
declare
  v_user_id uuid;
  v_project_id uuid;
  v_c_juan uuid := gen_random_uuid();
  v_c_maria uuid := gen_random_uuid();
  v_c_tito uuid := gen_random_uuid();
  v_c_ana uuid := gen_random_uuid();
  v_c_barkada uuid := gen_random_uuid();
  v_r_laptop uuid := gen_random_uuid();
  v_r_weekly uuid := gen_random_uuid();
  v_r_utang uuid := gen_random_uuid();
  v_r_salary uuid := gen_random_uuid();
  v_r_settled uuid := gen_random_uuid();
  v_pool uuid := gen_random_uuid();
  v_inst1 uuid;
  v_inst2 uuid;
  v_inst_overdue uuid;
begin
  select id into v_user_id from auth.users where lower(email) = lower('ryanvincecastillo@gmail.com');
  if v_user_id is null then
    raise exception 'auth.users row not found for ryanvincecastillo@gmail.com — sign in once first';
  end if;

  select id into v_project_id from public.projects where slug = 'debtnote-dev';
  if v_project_id is null then
    raise exception 'project debtnote-dev not found';
  end if;

  insert into public.project_members (project_id, user_id, role, status)
  values (v_project_id, v_user_id, 'owner', 'active')
  on conflict (project_id, user_id) do nothing;

  insert into public.debt_note_profiles (id, project_id, email, display_name, default_tone, plan_tier)
  values (v_user_id, v_project_id, 'ryanvincecastillo@gmail.com', 'Ryan', 'taglish_casual', 'free')
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(nullif(debt_note_profiles.display_name, ''), excluded.display_name),
        updated_at = now();

  -- Wipe previous demo rows for this owner (children cascade from records/contacts/pools)
  delete from public.debt_note_paluwagan_pools
  where owner_user_id = v_user_id and name like '[Demo]%';

  delete from public.debt_note_records
  where owner_user_id = v_user_id and title like '[Demo]%';

  delete from public.debt_note_contacts
  where owner_user_id = v_user_id and notes like '[Demo]%';

  -- Contacts
  insert into public.debt_note_contacts (id, project_id, owner_user_id, name, phone, email, notes) values
    (v_c_juan, v_project_id, v_user_id, 'Juan Dela Cruz', '09171234567', 'juan@example.com', '[Demo] Kapitbahay — pautang for laptop'),
    (v_c_maria, v_project_id, v_user_id, 'Maria Santos', '09189876543', 'maria@example.com', '[Demo] Weekly allowance borrower'),
    (v_c_tito, v_project_id, v_user_id, 'Tito Ben', '09175551234', null, '[Demo] Family — utang kay Tito'),
    (v_c_ana, v_project_id, v_user_id, 'Ana Reyes', '09170001122', 'ana@example.com', '[Demo] Semi-monthly salary loan'),
    (v_c_barkada, v_project_id, v_user_id, 'Barkada Office', null, null, '[Demo] Paluwagan group contact');

  -- Record: pautang laptop (partial)
  insert into public.debt_note_records (
    id, project_id, owner_user_id, contact_id, direction, title, principal, balance, schedule_type, status, notes
  ) values (
    v_r_laptop, v_project_id, v_user_id, v_c_juan, 'receivable',
    '[Demo] Bayad sa laptop', 15000, 10000, 'one_time', 'active', '[Demo] Partial collection'
  );
  insert into public.debt_note_installments (
    id, project_id, owner_user_id, record_id, sequence_no, amount, due_date, status
  ) values (
    gen_random_uuid(), v_project_id, v_user_id, v_r_laptop, 1, 15000, current_date + 14, 'pending'
  ) returning id into v_inst1;
  insert into public.debt_note_payments (
    project_id, owner_user_id, record_id, installment_id, amount, paid_at, notes
  ) values (
    v_project_id, v_user_id, v_r_laptop, v_inst1, 5000, now() - interval '3 days', '[Demo] Down payment'
  );

  -- Record: weekly with overdue installment
  insert into public.debt_note_records (
    id, project_id, owner_user_id, contact_id, direction, title, principal, balance, schedule_type, status, notes
  ) values (
    v_r_weekly, v_project_id, v_user_id, v_c_maria, 'receivable',
    '[Demo] Weekly allowance', 2000, 1500, 'weekly', 'active', '[Demo] 4 weeks'
  );
  insert into public.debt_note_installments (project_id, owner_user_id, record_id, sequence_no, amount, due_date, status, paid_at)
  values
    (v_project_id, v_user_id, v_r_weekly, 1, 500, current_date - 21, 'paid', now() - interval '20 days'),
    (v_project_id, v_user_id, v_r_weekly, 2, 500, current_date - 7, 'overdue', null),
    (v_project_id, v_user_id, v_r_weekly, 3, 500, current_date + 7, 'pending', null),
    (v_project_id, v_user_id, v_r_weekly, 4, 500, current_date + 14, 'pending', null);

  select id into v_inst_overdue
  from public.debt_note_installments
  where record_id = v_r_weekly and sequence_no = 2;

  select id into v_inst2
  from public.debt_note_installments
  where record_id = v_r_weekly and sequence_no = 3;

  -- Record: utang kay Tito
  insert into public.debt_note_records (
    id, project_id, owner_user_id, contact_id, direction, title, principal, balance, schedule_type, status, notes
  ) values (
    v_r_utang, v_project_id, v_user_id, v_c_tito, 'payable',
    '[Demo] Utang kay Tito', 5000, 5000, 'one_time', 'active', '[Demo] Need to pay back'
  );
  insert into public.debt_note_installments (
    project_id, owner_user_id, record_id, sequence_no, amount, due_date, status
  ) values (
    v_project_id, v_user_id, v_r_utang, 1, 5000, current_date + 10, 'pending'
  );

  -- Record: semi-monthly salary loan
  insert into public.debt_note_records (
    id, project_id, owner_user_id, contact_id, direction, title, principal, balance, schedule_type, status, notes
  ) values (
    v_r_salary, v_project_id, v_user_id, v_c_ana, 'payable',
    '[Demo] Salary loan', 12000, 8000, 'semi_monthly_15_30', 'active', '[Demo] 6 hulog'
  );
  insert into public.debt_note_installments (project_id, owner_user_id, record_id, sequence_no, amount, due_date, status, paid_at)
  values
    (v_project_id, v_user_id, v_r_salary, 1, 2000, current_date - 45, 'paid', now() - interval '44 days'),
    (v_project_id, v_user_id, v_r_salary, 2, 2000, current_date - 30, 'paid', now() - interval '29 days'),
    (v_project_id, v_user_id, v_r_salary, 3, 2000, current_date + 3, 'pending', null),
    (v_project_id, v_user_id, v_r_salary, 4, 2000, current_date + 18, 'pending', null),
    (v_project_id, v_user_id, v_r_salary, 5, 2000, current_date + 33, 'pending', null),
    (v_project_id, v_user_id, v_r_salary, 6, 2000, current_date + 48, 'pending', null);

  -- Settled record
  insert into public.debt_note_records (
    id, project_id, owner_user_id, contact_id, direction, title, principal, balance, schedule_type, status, notes
  ) values (
    v_r_settled, v_project_id, v_user_id, v_c_juan, 'receivable',
    '[Demo] Na-settle na', 1000, 0, 'one_time', 'paid', '[Demo] Fully paid'
  );
  insert into public.debt_note_installments (
    project_id, owner_user_id, record_id, sequence_no, amount, due_date, status, paid_at
  ) values (
    v_project_id, v_user_id, v_r_settled, 1, 1000, current_date - 5, 'paid', now() - interval '4 days'
  );
  insert into public.debt_note_payments (
    project_id, owner_user_id, record_id, amount, paid_at, notes
  ) values (
    v_project_id, v_user_id, v_r_settled, 1000, now() - interval '4 days', '[Demo] Full settle'
  );

  -- Reminders
  insert into public.debt_note_reminders (
    project_id, owner_user_id, record_id, installment_id, channel, tone, scheduled_at, status, sent_at
  ) values
    (v_project_id, v_user_id, v_r_weekly, v_inst_overdue, 'email', 'taglish_casual', now() + interval '2 hours', 'pending', null),
    (v_project_id, v_user_id, v_r_laptop, v_inst1, 'email', 'shinigami', now() - interval '1 day', 'sent', now() - interval '1 day'),
    (v_project_id, v_user_id, v_r_weekly, v_inst2, 'email', 'assertive', now() + interval '5 days', 'frozen', null);

  -- Guest agreement on laptop record
  insert into public.debt_note_agreements (
    project_id, owner_user_id, record_id, public_token, borrower_name, borrower_email, terms_json
  ) values (
    v_project_id, v_user_id, v_r_laptop,
    'demo-laptop-' || substr(replace(v_r_laptop::text, '-', ''), 1, 12),
    'Juan Dela Cruz', 'juan@example.com',
    jsonb_build_object('principal', 15000, 'title', '[Demo] Bayad sa laptop', 'demo', true)
  );

  -- Paluwagan pool
  insert into public.debt_note_paluwagan_pools (
    id, project_id, owner_user_id, name, contribution_amount, cycle_length, current_cycle, status
  ) values (
    v_pool, v_project_id, v_user_id, '[Demo] Office Paluwagan', 500, 5, 2, 'active'
  );

  insert into public.debt_note_paluwagan_members (
    project_id, owner_user_id, pool_id, contact_id, member_name, payout_order, has_received_payout
  ) values
    (v_project_id, v_user_id, v_pool, v_c_juan, 'Juan Dela Cruz', 1, true),
    (v_project_id, v_user_id, v_pool, v_c_maria, 'Maria Santos', 2, false),
    (v_project_id, v_user_id, v_pool, v_c_tito, 'Tito Ben', 3, false),
    (v_project_id, v_user_id, v_pool, v_c_ana, 'Ana Reyes', 4, false),
    (v_project_id, v_user_id, v_pool, v_c_barkada, 'Barkada Office', 5, false);

  raise notice 'Demo seed complete for user % project %', v_user_id, v_project_id;
end $$;
