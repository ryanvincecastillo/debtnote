-- DebtNote initial schema (debt_note_* prefix, shared public.projects tenancy)

create extension if not exists pgcrypto;

-- Ensure shared tenancy tables exist (no-op if already from InaanApp)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = auth.uid()
      and pm.status = 'active'
  );
$$;

insert into public.projects (slug, name)
values ('debtnote-dev', 'DebtNote Dev')
on conflict (slug) do nothing;

-- Profiles
create table if not exists public.debt_note_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,
  email text not null,
  display_name text not null default '',
  gcash_number text,
  maya_number text,
  default_tone text not null default 'taglish_casual'
    check (default_tone in ('taglish_casual', 'corporate', 'assertive', 'shinigami')),
  plan_tier text not null default 'free' check (plan_tier in ('free', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, id)
);

-- Contacts
create table if not exists public.debt_note_contacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Records (utang entries)
create table if not exists public.debt_note_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.debt_note_contacts(id) on delete set null,
  direction text not null check (direction in ('receivable', 'payable')),
  title text not null,
  principal numeric(14,2) not null check (principal > 0),
  balance numeric(14,2) not null check (balance >= 0),
  schedule_type text not null default 'one_time'
    check (schedule_type in ('one_time', 'daily', 'weekly', 'semi_monthly_15_30', 'paluwagan')),
  status text not null default 'active'
    check (status in ('active', 'paid', 'cancelled')),
  notes text,
  paluwagan_pool_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Installments
create table if not exists public.debt_note_installments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  record_id uuid not null references public.debt_note_records(id) on delete cascade,
  sequence_no int not null,
  amount numeric(14,2) not null check (amount > 0),
  due_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Payments
create table if not exists public.debt_note_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  record_id uuid not null references public.debt_note_records(id) on delete cascade,
  installment_id uuid references public.debt_note_installments(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

-- Agreements (guest-accessible via token)
create table if not exists public.debt_note_agreements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  record_id uuid not null references public.debt_note_records(id) on delete cascade,
  public_token text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  borrower_name text not null,
  borrower_email text,
  terms_json jsonb not null default '{}'::jsonb,
  signature_data text,
  signed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Reminders queue
create table if not exists public.debt_note_reminders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  record_id uuid not null references public.debt_note_records(id) on delete cascade,
  installment_id uuid references public.debt_note_installments(id) on delete set null,
  channel text not null default 'email' check (channel in ('email', 'sms')),
  tone text not null default 'taglish_casual'
    check (tone in ('taglish_casual', 'corporate', 'assertive', 'shinigami')),
  scheduled_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'frozen', 'cancelled', 'failed')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

-- Proof submissions
create table if not exists public.debt_note_proof_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  record_id uuid not null references public.debt_note_records(id) on delete cascade,
  storage_path text not null,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected')),
  submitted_at timestamptz not null default now(),
  verified_at timestamptz
);

-- Paluwagan pools
create table if not exists public.debt_note_paluwagan_pools (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  contribution_amount numeric(14,2) not null check (contribution_amount > 0),
  cycle_length int not null check (cycle_length > 0),
  current_cycle int not null default 1,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debt_note_records
  add constraint debt_note_records_paluwagan_fk
  foreign key (paluwagan_pool_id) references public.debt_note_paluwagan_pools(id) on delete set null;

create table if not exists public.debt_note_paluwagan_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  pool_id uuid not null references public.debt_note_paluwagan_pools(id) on delete cascade,
  contact_id uuid references public.debt_note_contacts(id) on delete set null,
  member_name text not null,
  payout_order int not null,
  has_received_payout boolean not null default false,
  created_at timestamptz not null default now(),
  unique (pool_id, payout_order)
);

-- Indexes
create index if not exists idx_debt_note_profiles_project on public.debt_note_profiles(project_id);
create index if not exists idx_debt_note_contacts_owner on public.debt_note_contacts(project_id, owner_user_id);
create index if not exists idx_debt_note_records_owner on public.debt_note_records(project_id, owner_user_id);
create index if not exists idx_debt_note_installments_record on public.debt_note_installments(record_id, due_date);
create index if not exists idx_debt_note_reminders_queue on public.debt_note_reminders(status, scheduled_at) where status = 'pending';
create index if not exists idx_debt_note_agreements_token on public.debt_note_agreements(public_token);

-- Updated_at trigger
create or replace function public.debt_note_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_debt_note_profiles_updated on public.debt_note_profiles;
create trigger trg_debt_note_profiles_updated before update on public.debt_note_profiles
for each row execute function public.debt_note_set_updated_at();

drop trigger if exists trg_debt_note_contacts_updated on public.debt_note_contacts;
create trigger trg_debt_note_contacts_updated before update on public.debt_note_contacts
for each row execute function public.debt_note_set_updated_at();

drop trigger if exists trg_debt_note_records_updated on public.debt_note_records;
create trigger trg_debt_note_records_updated before update on public.debt_note_records
for each row execute function public.debt_note_set_updated_at();

-- RLS
alter table public.debt_note_profiles enable row level security;
alter table public.debt_note_contacts enable row level security;
alter table public.debt_note_records enable row level security;
alter table public.debt_note_installments enable row level security;
alter table public.debt_note_payments enable row level security;
alter table public.debt_note_agreements enable row level security;
alter table public.debt_note_reminders enable row level security;
alter table public.debt_note_proof_submissions enable row level security;
alter table public.debt_note_paluwagan_pools enable row level security;
alter table public.debt_note_paluwagan_members enable row level security;

-- Profile policies
drop policy if exists debt_note_profiles_select on public.debt_note_profiles;
create policy debt_note_profiles_select on public.debt_note_profiles for select
using (public.is_project_member(project_id) and id = auth.uid());

drop policy if exists debt_note_profiles_insert on public.debt_note_profiles;
create policy debt_note_profiles_insert on public.debt_note_profiles for insert
with check (public.is_project_member(project_id) and id = auth.uid());

drop policy if exists debt_note_profiles_update on public.debt_note_profiles;
create policy debt_note_profiles_update on public.debt_note_profiles for update
using (public.is_project_member(project_id) and id = auth.uid());

-- Generic owner policies macro pattern
drop policy if exists debt_note_contacts_all on public.debt_note_contacts;
create policy debt_note_contacts_all on public.debt_note_contacts for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

drop policy if exists debt_note_records_all on public.debt_note_records;
create policy debt_note_records_all on public.debt_note_records for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

drop policy if exists debt_note_installments_all on public.debt_note_installments;
create policy debt_note_installments_all on public.debt_note_installments for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

drop policy if exists debt_note_payments_all on public.debt_note_payments;
create policy debt_note_payments_all on public.debt_note_payments for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

drop policy if exists debt_note_agreements_all on public.debt_note_agreements;
create policy debt_note_agreements_all on public.debt_note_agreements for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

drop policy if exists debt_note_reminders_all on public.debt_note_reminders;
create policy debt_note_reminders_all on public.debt_note_reminders for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

drop policy if exists debt_note_proof_all on public.debt_note_proof_submissions;
create policy debt_note_proof_all on public.debt_note_proof_submissions for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

drop policy if exists debt_note_paluwagan_pools_all on public.debt_note_paluwagan_pools;
create policy debt_note_paluwagan_pools_all on public.debt_note_paluwagan_pools for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

drop policy if exists debt_note_paluwagan_members_all on public.debt_note_paluwagan_members;
create policy debt_note_paluwagan_members_all on public.debt_note_paluwagan_members for all
using (public.is_project_member(project_id) and owner_user_id = auth.uid())
with check (public.is_project_member(project_id) and owner_user_id = auth.uid());

-- RPC: ensure profile + project membership
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
  values (v_user_id, p_project_id, coalesce(v_email, ''), coalesce(nullif(trim(p_display_name), ''), split_part(coalesce(v_email, 'user'), '@', 1)))
  on conflict (id) do update set
    display_name = case when excluded.display_name <> '' then excluded.display_name else debt_note_profiles.display_name end,
    updated_at = now()
  returning * into v_profile;

  return v_profile;
end;
$$;

-- RPC: create record with schedule
create or replace function public.debt_note_create_record_with_schedule(
  p_project_id uuid,
  p_contact_id uuid,
  p_direction text,
  p_title text,
  p_principal numeric,
  p_schedule_type text,
  p_installment_count int default 1,
  p_start_date date default current_date,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_record_id uuid;
  v_per_installment numeric;
  v_i int;
  v_due date;
  v_day int;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if not public.is_project_member(p_project_id) then raise exception 'Not a project member'; end if;

  insert into public.debt_note_records (
    project_id, owner_user_id, contact_id, direction, title, principal, balance, schedule_type, notes
  ) values (
    p_project_id, v_user_id, p_contact_id, p_direction, p_title, p_principal, p_principal, p_schedule_type, p_notes
  ) returning id into v_record_id;

  if p_schedule_type = 'one_time' or p_installment_count <= 1 then
    insert into public.debt_note_installments (project_id, owner_user_id, record_id, sequence_no, amount, due_date)
    values (p_project_id, v_user_id, v_record_id, 1, p_principal, p_start_date);
  else
    v_per_installment := round(p_principal / p_installment_count, 2);
    for v_i in 1..p_installment_count loop
      v_due := p_start_date;
      if p_schedule_type = 'daily' then
        v_due := p_start_date + (v_i - 1);
      elsif p_schedule_type = 'weekly' then
        v_due := p_start_date + ((v_i - 1) * 7);
      elsif p_schedule_type = 'semi_monthly_15_30' then
        v_day := case when v_i % 2 = 1 then 15 else 30 end;
        v_due := (date_trunc('month', p_start_date) + ((v_i - 1) / 2) * interval '1 month' + (v_day - 1) * interval '1 day')::date;
      else
        v_due := p_start_date + (v_i - 1) * 7;
      end if;

      insert into public.debt_note_installments (project_id, owner_user_id, record_id, sequence_no, amount, due_date)
      values (
        p_project_id, v_user_id, v_record_id, v_i,
        case when v_i = p_installment_count then p_principal - v_per_installment * (p_installment_count - 1) else v_per_installment end,
        v_due
      );
    end loop;
  end if;

  return v_record_id;
end;
$$;

-- RPC: record payment
create or replace function public.debt_note_record_payment(
  p_project_id uuid,
  p_record_id uuid,
  p_amount numeric,
  p_installment_id uuid default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_payment_id uuid;
  v_balance numeric;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  insert into public.debt_note_payments (project_id, owner_user_id, record_id, installment_id, amount, notes)
  values (p_project_id, v_user_id, p_record_id, p_installment_id, p_amount, p_notes)
  returning id into v_payment_id;

  update public.debt_note_records
  set balance = greatest(0, balance - p_amount),
      status = case when greatest(0, balance - p_amount) = 0 then 'paid' else status end,
      updated_at = now()
  where id = p_record_id and owner_user_id = v_user_id and project_id = p_project_id;

  if p_installment_id is not null then
    update public.debt_note_installments
    set status = 'paid', paid_at = now()
    where id = p_installment_id and owner_user_id = v_user_id;
  end if;

  return v_payment_id;
end;
$$;

-- RPC: freeze reminders on proof
create or replace function public.debt_note_submit_proof(
  p_project_id uuid,
  p_record_id uuid,
  p_storage_path text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_proof_id uuid;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  insert into public.debt_note_proof_submissions (project_id, owner_user_id, record_id, storage_path)
  values (p_project_id, v_user_id, p_record_id, p_storage_path)
  returning id into v_proof_id;

  update public.debt_note_reminders
  set status = 'frozen'
  where record_id = p_record_id and owner_user_id = v_user_id and status = 'pending';

  return v_proof_id;
end;
$$;

-- Guest RPCs
create or replace function public.debt_note_get_agreement_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
begin
  select a.*, r.title as record_title, r.principal, r.balance, r.direction
  into v_row
  from public.debt_note_agreements a
  join public.debt_note_records r on r.id = a.record_id
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
    'direction', v_row.direction
  );
end;
$$;

create or replace function public.debt_note_sign_agreement(p_token text, p_signature text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.debt_note_agreements
  set signature_data = p_signature, signed_at = now()
  where public_token = p_token
    and signed_at is null
    and (expires_at is null or expires_at > now());
  return found;
end;
$$;

-- Storage bucket for proofs
insert into storage.buckets (id, name, public)
values ('debt-note-proofs', 'debt-note-proofs', false)
on conflict (id) do nothing;

drop policy if exists debt_note_proofs_select on storage.objects;
create policy debt_note_proofs_select on storage.objects for select
using (bucket_id = 'debt-note-proofs' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists debt_note_proofs_insert on storage.objects;
create policy debt_note_proofs_insert on storage.objects for insert
with check (bucket_id = 'debt-note-proofs' and auth.uid()::text = (storage.foldername(name))[1]);

grant execute on function public.debt_note_ensure_profile(uuid, text) to authenticated;
grant execute on function public.debt_note_create_record_with_schedule(uuid, uuid, text, text, numeric, text, int, date, text) to authenticated;
grant execute on function public.debt_note_record_payment(uuid, uuid, numeric, uuid, text) to authenticated;
grant execute on function public.debt_note_submit_proof(uuid, uuid, text) to authenticated;
grant execute on function public.debt_note_get_agreement_by_token(text) to anon, authenticated;
grant execute on function public.debt_note_sign_agreement(text, text) to anon, authenticated;
