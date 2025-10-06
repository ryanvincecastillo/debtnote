# Debt Note - System Architecture & Roadmap
## Supabase-Powered Microfinance Platform for Philippine Market

---

## Executive Summary

Debt Note is a modern microfinance lending management system designed for the Philippine market, built with **Next.js**, **React Native Expo**, and **Supabase** as the backend infrastructure. This architecture prioritizes rapid development, cost efficiency, and regulatory compliance with SEC requirements.

**Key Technology Decisions**:
- ✅ **Supabase** as Backend-as-a-Service (BaaS)
- ✅ **Next.js 14+** for Admin Dashboard
- ✅ **React Native Expo** for Field Officer Mobile App
- ✅ **TypeScript** across entire stack
- ✅ **Monorepo Structure** for code sharing

---

## 1. REGULATORY REQUIREMENTS (Philippines)

### Legal Structure
- **Entity Type**: Stock Corporation registered with SEC
- **Minimum Paid-in Capital**: PHP 1,000,000 (may vary by location)
- **Certificate of Authority**: Required from SEC before operations
- **Foreign Ownership**: 100% foreign ownership allowed (restrictions on land-secured loans)
- **Company Name**: Must include "Lending Company" or "Lending Investor"

### Compliance Requirements
- **SEC Registration**: Primary regulatory body
- **BIR Registration**: Tax obligations (TIN)
- **SSS, PhilHealth, Pag-IBIG**: Employee benefits
- **Mayor's Permit**: Local government unit clearance
- **Barangay Clearance**: Community-level clearance
- **Data Privacy Compliance**: RA 10173 (Data Privacy Act of 2012)
- **Truth in Lending Act**: RA 3765 compliance
- **Consumer Act**: RA 7394 compliance
- **Fair Debt Collection**: SEC Memorandum Circulars

### Operational Compliance
- Annual financial reporting to SEC
- Loan documentation standards
- Interest rate disclosure requirements
- Anti-money laundering (AMLA) compliance
- KYC (Know Your Customer) procedures

---

## 2. SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
├──────────────────────────┬──────────────────────────────────┤
│   debtnote-dashboard     │      debtnote-ops                │
│   (Next.js 14+)          │   (React Native Expo)            │
│   - Admin Portal         │   - Field Officer App            │
│   - Branch Management    │   - Collection Interface         │
│   - Reports & Analytics  │   - Offline Capable              │
└──────────────────────────┴──────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Supabase Client SDK   │
              │  - Auto-generated APIs  │
              │  - Real-time Updates    │
              │  - Type-safe Queries    │
              └─────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌───────────────┐
│   Supabase    │  │   Supabase     │  │   Supabase    │
│ Authentication│  │   PostgreSQL   │  │    Storage    │
├───────────────┤  ├────────────────┤  ├───────────────┤
│ - JWT Auth    │  │ - Transactions │  │ - Documents   │
│ - User Mgmt   │  │ - Customers    │  │ - KYC Files   │
│ - RLS         │  │ - Loans        │  │ - Receipts    │
│ - Multi-role  │  │ - Payments     │  │ - Agreements  │
└───────────────┘  │ - Reports      │  └───────────────┘
                   │ - Audit Logs   │
                   └────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Supabase Edge         │
              │   Functions (Deno)      │
              ├─────────────────────────┤
              │ - EMI Calculations      │
              │ - Payment Processing    │
              │ - SMS Notifications     │
              │ - Credit Scoring        │
              │ - Cron Jobs             │
              │ - Webhooks              │
              └─────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌───────────────┐
│   Payment     │  │      SMS       │  │    Credit     │
│   Gateways    │  │   Providers    │  │    Bureau     │
├───────────────┤  ├────────────────┤  ├───────────────┤
│ - GCash       │  │ - Semaphore    │  │ - CIC         │
│ - PayMaya     │  │ - Vonage       │  │ - CIBI        │
│ - Xendit      │  │ - Twilio       │  │ - TransUnion  │
└───────────────┘  └────────────────┘  └───────────────┘
```

### Technology Stack

#### Frontend Applications

**1. debtnote-dashboard (Admin Web App)**
```
Framework: Next.js 14+ (App Router)
Language: TypeScript 5+
UI Library: Tailwind CSS + shadcn/ui
State Management: Zustand
Data Fetching: TanStack Query (React Query) + Supabase Client
Forms: React Hook Form + Zod validation
Tables: TanStack Table (React Table v8)
Charts: Recharts or Chart.js
Calendar: React Big Calendar
PDF Generation: react-pdf or jsPDF
Export: xlsx for Excel exports
Icons: Lucide React
Date: date-fns
Deployment: Vercel or AWS Amplify
```

**2. debtnote-ops (Field Officer Mobile App)**
```
Framework: React Native with Expo
Language: TypeScript 5+
Navigation: Expo Router or React Navigation
UI Components: React Native Paper or NativeBase
State Management: Zustand
Data Fetching: TanStack Query + Supabase Client
Offline Storage: SQLite (expo-sqlite) + AsyncStorage
Camera: expo-camera or expo-image-picker
Maps: react-native-maps
GPS: expo-location
Biometrics: expo-local-authentication
Push Notifications: expo-notifications
Barcode/QR: expo-barcode-scanner
Forms: React Hook Form + Zod
Date: date-fns
Build: EAS Build (Expo Application Services)
```

#### Backend Infrastructure (Supabase)

**Core Services**:
```
Database: PostgreSQL 15+ (Managed by Supabase)
Authentication: Supabase Auth (JWT-based)
Storage: Supabase Storage (S3-compatible)
Real-time: Supabase Realtime (WebSocket)
Edge Functions: Deno Runtime
API: Auto-generated REST & GraphQL
Cron Jobs: pg_cron (PostgreSQL extension)
```

**Edge Functions Stack**:
```
Runtime: Deno 1.x
Language: TypeScript
HTTP Server: Deno std/http
Validation: Zod
External APIs: Fetch API
Scheduling: Supabase Cron
```

**Database Extensions**:
```
- pg_cron (scheduled jobs)
- pgvector (for AI/ML features later)
- pg_stat_statements (query performance)
- uuid-ossp (UUID generation)
- postgis (geolocation features)
```

#### Development Tools

```
Version Control: Git + GitHub
Package Manager: pnpm (for monorepo)
Monorepo: Turborepo or pnpm workspaces
Code Quality: ESLint + Prettier
Type Checking: TypeScript strict mode
Testing:
  - Unit: Vitest
  - E2E: Playwright (web) + Detox (mobile)
  - Integration: Supabase local development
CI/CD: GitHub Actions
Documentation: Typedoc + Markdown
API Testing: Bruno or Postman
```

---

## 3. PROJECT STRUCTURE

### Monorepo Organization

```
debtnote/
│
├── apps/
│   ├── dashboard/                          # Next.js Admin Dashboard
│   │   ├── src/
│   │   │   ├── app/                       # Next.js 14 App Router
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── customers/
│   │   │   │   │   ├── loans/
│   │   │   │   │   ├── collections/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── api/                   # API routes (if needed)
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/                    # shadcn/ui components
│   │   │   │   ├── forms/
│   │   │   │   ├── tables/
│   │   │   │   ├── charts/
│   │   │   │   └── layouts/
│   │   │   ├── lib/
│   │   │   │   ├── supabase/
│   │   │   │   │   ├── client.ts         # Browser client
│   │   │   │   │   ├── server.ts         # Server client
│   │   │   │   │   └── middleware.ts     # Auth middleware
│   │   │   │   ├── hooks/
│   │   │   │   ├── utils/
│   │   │   │   └── validations/
│   │   │   ├── stores/                    # Zustand stores
│   │   │   ├── styles/
│   │   │   └── types/
│   │   ├── public/
│   │   ├── tests/
│   │   ├── .env.local
│   │   ├── .env.example
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── ops/                               # React Native Field Officer App
│       ├── src/
│       │   ├── app/                       # Expo Router
│       │   │   ├── (auth)/
│       │   │   │   └── login.tsx
│       │   │   ├── (tabs)/                # Bottom tabs navigation
│       │   │   │   ├── home.tsx
│       │   │   │   ├── collections.tsx
│       │   │   │   ├── customers.tsx
│       │   │   │   └── profile.tsx
│       │   │   └── _layout.tsx
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── forms/
│       │   │   ├── lists/
│       │   │   └── camera/
│       │   ├── lib/
│       │   │   ├── supabase/
│       │   │   │   └── client.ts
│       │   │   ├── offline/
│       │   │   │   ├── db.ts             # SQLite setup
│       │   │   │   ├── sync.ts           # Sync logic
│       │   │   │   └── queue.ts          # Offline queue
│       │   │   ├── hooks/
│       │   │   ├── utils/
│       │   │   └── validations/
│       │   ├── stores/                    # Zustand stores
│       │   ├── types/
│       │   └── constants/
│       ├── assets/
│       ├── tests/
│       ├── .env
│       ├── .env.example
│       ├── app.json
│       ├── eas.json                       # EAS Build config
│       ├── babel.config.js
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                              # Shared packages
│   ├── types/                            # Shared TypeScript types
│   │   ├── database.ts                   # Database types (auto-generated)
│   │   ├── api.ts                        # API types
│   │   └── index.ts
│   │
│   ├── utils/                            # Shared utilities
│   │   ├── calculations/
│   │   │   ├── emi.ts
│   │   │   ├── interest.ts
│   │   │   └── penalties.ts
│   │   ├── formatters/
│   │   ├── validators/
│   │   └── index.ts
│   │
│   ├── config/                           # Shared configuration
│   │   ├── eslint-config/
│   │   ├── tsconfig/
│   │   └── tailwind-config/
│   │
│   └── ui/                               # Shared UI components (optional)
│       └── package.json
│
├── supabase/                             # Supabase Configuration
│   ├── migrations/                       # Database migrations
│   │   ├── 20250101000000_initial_schema.sql
│   │   ├── 20250101000001_create_customers.sql
│   │   ├── 20250101000002_create_loans.sql
│   │   ├── 20250101000003_create_payments.sql
│   │   ├── 20250101000004_create_rls_policies.sql
│   │   └── 20250101000005_create_triggers.sql
│   │
│   ├── functions/                        # Edge Functions
│   │   ├── calculate-emi/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── process-payment/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── send-sms/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── daily-interest-calculation/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── send-payment-reminders/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   ├── webhook-payment-gateway/
│   │   │   ├── index.ts
│   │   │   └── deno.json
│   │   └── credit-score-calculator/
│   │       ├── index.ts
│   │       └── deno.json
│   │
│   ├── seed.sql                          # Seed data for development
│   ├── config.toml                       # Supabase config
│   └── .env.local                        # Local Supabase credentials
│
├── docs/                                 # Documentation
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── deployment/
│   └── user-guides/
│
├── scripts/                              # Utility scripts
│   ├── generate-types.sh                # Generate types from DB
│   ├── seed-database.sh
│   └── deploy.sh
│
├── .github/
│   └── workflows/                        # CI/CD workflows
│       ├── dashboard-deploy.yml
│       ├── ops-build.yml
│       └── test.yml
│
├── .gitignore
├── .npmrc
├── pnpm-workspace.yaml                   # pnpm workspace config
├── turbo.json                            # Turborepo config
├── package.json                          # Root package.json
└── README.md
```

---

## 4. DATABASE SCHEMA

### Core Tables (PostgreSQL)

```sql
-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Supabase handles auth.users automatically
-- We extend with a profiles table

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'loan_officer', 'field_officer', 'accountant', 'auditor')),
  branch_id UUID REFERENCES public.branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORGANIZATION STRUCTURE
-- ============================================

CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  province TEXT,
  phone TEXT,
  email TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_code TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  civil_status TEXT CHECK (civil_status IN ('single', 'married', 'widowed', 'separated', 'divorced')),
  
  -- Contact Information
  email TEXT,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  
  -- Address
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  barangay TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  
  -- Identification
  id_type TEXT, -- TIN, SSS, GSIS, Passport, Driver's License
  id_number TEXT,
  
  -- Employment
  occupation TEXT,
  employer_name TEXT,
  monthly_income DECIMAL(12,2),
  
  -- Banking
  bank_name TEXT,
  bank_account_number TEXT,
  gcash_number TEXT,
  paymaya_number TEXT,
  
  -- KYC Status
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  kyc_verified_by UUID REFERENCES public.profiles(id),
  
  -- Credit Information
  credit_score INTEGER,
  credit_score_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Management
  branch_id UUID REFERENCES public.branches(id),
  assigned_officer_id UUID REFERENCES public.profiles(id),
  customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'group', 'business')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'deceased')),
  
  -- Metadata
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Full text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(first_name, '') || ' ' || 
                           coalesce(last_name, '') || ' ' || 
                           coalesce(customer_code, '') || ' ' ||
                           coalesce(phone, ''))
  ) STORED
);

CREATE INDEX idx_customers_search ON public.customers USING GIN(search_vector);
CREATE INDEX idx_customers_branch ON public.customers(branch_id);
CREATE INDEX idx_customers_officer ON public.customers(assigned_officer_id);

-- ============================================
-- CUSTOMER DOCUMENTS
-- ============================================

CREATE TABLE public.customer_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- id_front, id_back, proof_of_income, proof_of_address, etc.
  file_path TEXT NOT NULL, -- Supabase storage path
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LOAN PRODUCTS
-- ============================================

CREATE TABLE public.loan_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Loan Terms
  min_amount DECIMAL(12,2) NOT NULL,
  max_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL, -- Annual rate
  interest_calculation TEXT NOT NULL CHECK (interest_calculation IN ('flat', 'declining', 'simple')),
  
  -- Tenure
  min_tenure_months INTEGER NOT NULL,
  max_tenure_months INTEGER NOT NULL,
  
  -- Repayment
  repayment_frequency TEXT NOT NULL CHECK (repayment_frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly')),
  
  -- Fees
  processing_fee_percentage DECIMAL(5,2) DEFAULT 0,
  processing_fee_flat DECIMAL(12,2) DEFAULT 0,
  late_payment_penalty_percentage DECIMAL(5,2) DEFAULT 0,
  late_payment_penalty_flat DECIMAL(12,2) DEFAULT 0,
  
  -- Requirements
  requires_collateral BOOLEAN DEFAULT false,
  requires_guarantor BOOLEAN DEFAULT false,
  min_credit_score INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LOANS
-- ============================================

CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_number TEXT UNIQUE NOT NULL,
  
  -- Relationships
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  loan_product_id UUID REFERENCES public.loan_products(id) NOT NULL,
  branch_id UUID REFERENCES public.branches(id) NOT NULL,
  loan_officer_id UUID REFERENCES public.profiles(id),
  
  -- Loan Details
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  repayment_frequency TEXT NOT NULL,
  
  -- Calculated Amounts
  total_interest DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL, -- principal + interest + fees
  monthly_installment DECIMAL(12,2),
  processing_fee DECIMAL(12,2) DEFAULT 0,
  
  -- Disbursement
  disbursement_amount DECIMAL(12,2), -- After deducting fees
  disbursement_date DATE,
  disbursement_method TEXT, -- cash, bank_transfer, gcash, paymaya
  disbursement_reference TEXT,
  
  -- Dates
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approval_date DATE,
  first_payment_date DATE,
  maturity_date DATE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'approved', 'rejected', 
    'disbursed', 'active', 'fully_paid', 'written_off', 'restructured'
  )),
  
  -- Payment Tracking
  total_paid DECIMAL(12,2) DEFAULT 0,
  principal_paid DECIMAL(12,2) DEFAULT 0,
  interest_paid DECIMAL(12,2) DEFAULT 0,
  penalty_paid DECIMAL(12,2) DEFAULT 0,
  outstanding_balance DECIMAL(12,2),
  
  -- Risk
  days_past_due INTEGER DEFAULT 0,
  is_overdue BOOLEAN DEFAULT false,
  
  -- Workflow
  approved_by UUID REFERENCES public.profiles(id),
  rejected_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_loans_customer ON public.loans(customer_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_branch ON public.loans(branch_id);
CREATE INDEX idx_loans_officer ON public.loans(loan_officer_id);
CREATE INDEX idx_loans_overdue ON public.loans(is_overdue) WHERE is_overdue = true;

-- ============================================
-- LOAN SCHEDULE (EMI Schedule)
-- ============================================

CREATE TABLE public.loan_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  
  -- Amounts
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_amount DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  
  -- Payment Status
  paid_amount DECIMAL(12,2) DEFAULT 0,
  principal_paid DECIMAL(12,2) DEFAULT 0,
  interest_paid DECIMAL(12,2) DEFAULT 0,
  penalty_amount DECIMAL(12,2) DEFAULT 0,
  outstanding_amount DECIMAL(12,2),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  paid_date DATE,
  days_overdue INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(loan_id, installment_number)
);

CREATE INDEX idx_loan_schedules_loan ON public.loan_schedules(loan_id);
CREATE INDEX idx_loan_schedules_due_date ON public.loan_schedules(due_date);
CREATE INDEX idx_loan_schedules_status ON public.loan_schedules(status);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT UNIQUE NOT NULL,
  
  -- Relationships
  loan_id UUID REFERENCES public.loans(id) NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  loan_schedule_id UUID REFERENCES public.loan_schedules(id),
  
  -- Payment Details
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12,2) NOT NULL,
  
  -- Allocation
  principal_paid DECIMAL(12,2) DEFAULT 0,
  interest_paid DECIMAL(12,2) DEFAULT 0,
  penalty_paid DECIMAL(12,2) DEFAULT 0,
  advance_payment DECIMAL(12,2) DEFAULT 0,
  
  -- Payment Method
  payment_method TEXT NOT NULL CHECK (payment_method IN (
    'cash', 'bank_transfer', 'gcash', 'paymaya', 'check', 'online'
  )),
  payment_reference TEXT, -- Transaction ID, check number, etc.
  
  -- Collection Info
  collected_by UUID REFERENCES public.profiles(id),
  collection_location TEXT,
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'reversed')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_loan ON public.payments(loan_id);
CREATE INDEX idx_payments_customer ON public.payments(customer_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_payments_collected_by ON public.payments(collected_by);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL, -- payment_reminder, loan_approved, payment_received, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Delivery
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Context
  reference_type TEXT, -- loan, payment, customer
  reference_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES public.profiles(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);

-- ============================================
-- SETTINGS & CONFIGURATION
-- ============================================

CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. SUPABASE CONFIGURATION

### Row Level Security (RLS) Policies

```sql
-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Get User Role
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $
  SELECT role FROM public.profiles WHERE id = auth.uid();
$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_branch()
RETURNS UUID AS $
  SELECT branch_id FROM public.profiles WHERE id = auth.uid();
$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- RLS POLICIES: PROFILES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins and managers can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (get_user_role() IN ('admin', 'manager'));

-- Admins can update profiles
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (get_user_role() = 'admin');

-- ============================================
-- RLS POLICIES: CUSTOMERS
-- ============================================

-- Users can view customers in their branch
CREATE POLICY "Users view customers in branch"
  ON public.customers FOR SELECT
  USING (
    branch_id = get_user_branch() OR 
    get_user_role() IN ('admin', 'manager')
  );

-- Loan officers and above can create customers
CREATE POLICY "Officers can create customers"
  ON public.customers FOR INSERT
  WITH CHECK (
    get_user_role() IN ('admin', 'manager', 'loan_officer', 'field_officer')
  );

-- Officers can update customers in their branch
CREATE POLICY "Officers can update customers"
  ON public.customers FOR UPDATE
  USING (
    (branch_id = get_user_branch() AND 
     get_user_role() IN ('admin', 'manager', 'loan_officer')) OR
    get_user_role() = 'admin'
  );

-- ============================================
-- RLS POLICIES: LOANS
-- ============================================

-- Users can view loans in their branch
CREATE POLICY "Users view loans in branch"
  ON public.loans FOR SELECT
  USING (
    branch_id = get_user_branch() OR 
    get_user_role() IN ('admin', 'manager', 'accountant', 'auditor')
  );

-- Loan officers can create loans
CREATE POLICY "Officers can create loans"
  ON public.loans FOR INSERT
  WITH CHECK (
    get_user_role() IN ('admin', 'manager', 'loan_officer')
  );

-- Managers and admins can update loans
CREATE POLICY "Managers can update loans"
  ON public.loans FOR UPDATE
  USING (
    (branch_id = get_user_branch() AND 
     get_user_role() IN ('admin', 'manager')) OR
    get_user_role() = 'admin'
  );

-- ============================================
-- RLS POLICIES: PAYMENTS
-- ============================================

-- Users can view payments in their branch
CREATE POLICY "Users view payments in branch"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.loans 
      WHERE loans.id = payments.loan_id 
      AND (loans.branch_id = get_user_branch() OR 
           get_user_role() IN ('admin', 'manager', 'accountant', 'auditor'))
    )
  );

-- Field officers and above can create payments
CREATE POLICY "Officers can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (
    get_user_role() IN ('admin', 'manager', 'loan_officer', 'field_officer')
  );

-- ============================================
-- RLS POLICIES: NOTIFICATIONS
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- RLS POLICIES: AUDIT LOGS
-- ============================================

-- Only admins and auditors can view audit logs
CREATE POLICY "Admins view audit logs"
  ON public.audit_logs FOR SELECT
  USING (get_user_role() IN ('admin', 'auditor'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
```

### Database Triggers

```sql
-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.loan_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- TRIGGER: Audit Log for Critical Tables
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_audit_log()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to critical tables
CREATE TRIGGER audit_loans
  AFTER INSERT OR UPDATE OR DELETE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER audit_customers
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- ============================================
-- TRIGGER: Update Loan Outstanding Balance
-- ============================================

CREATE OR REPLACE FUNCTION public.update_loan_balance()
RETURNS TRIGGER AS $
BEGIN
  UPDATE public.loans
  SET 
    total_paid = total_paid + NEW.amount,
    principal_paid = principal_paid + NEW.principal_paid,
    interest_paid = interest_paid + NEW.interest_paid,
    penalty_paid = penalty_paid + NEW.penalty_paid,
    outstanding_balance = total_amount - (total_paid + NEW.amount),
    updated_at = NOW()
  WHERE id = NEW.loan_id;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_loan_on_payment
  AFTER INSERT ON public.payments
  FOR EACH ROW 
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.update_loan_balance();

-- ============================================
-- TRIGGER: Generate Loan Number
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_loan_number()
RETURNS TRIGGER AS $
DECLARE
  branch_code TEXT;
  loan_count INTEGER;
  new_loan_number TEXT;
BEGIN
  -- Get branch code
  SELECT code INTO branch_code FROM public.branches WHERE id = NEW.branch_id;
  
  -- Count loans in branch for this year
  SELECT COUNT(*) INTO loan_count 
  FROM public.loans 
  WHERE branch_id = NEW.branch_id 
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  -- Generate: LN-{BRANCH}-{YEAR}-{NUMBER}
  new_loan_number := 'LN-' || branch_code || '-' || 
                     EXTRACT(YEAR FROM NOW()) || '-' || 
                     LPAD((loan_count + 1)::TEXT, 5, '0');
  
  NEW.loan_number := new_loan_number;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER set_loan_number
  BEFORE INSERT ON public.loans
  FOR EACH ROW
  WHEN (NEW.loan_number IS NULL)
  EXECUTE FUNCTION public.generate_loan_number();
```

---

## 6. SUPABASE EDGE FUNCTIONS

### Example Edge Functions

#### 1. Calculate EMI
```typescript
// supabase/functions/calculate-emi/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EMIRequest {
  principal: number
  annual_rate: number
  tenure_months: number
  calculation_type: 'flat' | 'declining' | 'simple'
}

serve(async (req) => {
  try {
    const { principal, annual_rate, tenure_months, calculation_type }: EMIRequest = await req.json()

    let emi = 0
    let total_interest = 0
    let total_amount = 0

    if (calculation_type === 'declining') {
      // Declining/Reducing Balance Method
      const monthly_rate = annual_rate / 12 / 100
      emi = (principal * monthly_rate * Math.pow(1 + monthly_rate, tenure_months)) / 
            (Math.pow(1 + monthly_rate, tenure_months) - 1)
      total_amount = emi * tenure_months
      total_interest = total_amount - principal
    } 
    else if (calculation_type === 'flat') {
      // Flat Rate Method
      total_interest = (principal * annual_rate * tenure_months) / (12 * 100)
      total_amount = principal + total_interest
      emi = total_amount / tenure_months
    }
    else if (calculation_type === 'simple') {
      // Simple Interest
      const years = tenure_months / 12
      total_interest = (principal * annual_rate * years) / 100
      total_amount = principal + total_interest
      emi = total_amount / tenure_months
    }

    return new Response(
      JSON.stringify({
        emi: parseFloat(emi.toFixed(2)),
        total_interest: parseFloat(total_interest.toFixed(2)),
        total_amount: parseFloat(total_amount.toFixed(2)),
        monthly_payment: parseFloat(emi.toFixed(2))
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

#### 2. Send SMS Notification
```typescript
// supabase/functions/send-sms/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SEMAPHORE_API_KEY = Deno.env.get('SEMAPHORE_API_KEY')
const SEMAPHORE_API_URL = 'https://api.semaphore.co/api/v4/messages'

interface SMSRequest {
  phone: string
  message: string
  sender_name?: string
}

serve(async (req) => {
  try {
    const { phone, message, sender_name = 'DebtNote' }: SMSRequest = await req.json()

    const response = await fetch(SEMAPHORE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: SEMAPHORE_API_KEY,
        number: phone,
        message: message,
        sendername: sender_name
      })
    })

    const data = await response.json()

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

#### 3. Daily Interest Calculation (Cron Job)
```typescript
// supabase/functions/daily-interest-calculation/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Get all active loans
    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .eq('status', 'active')

    if (error) throw error

    for (const loan of loans) {
      // Calculate daily interest
      const daily_rate = loan.interest_rate / 365 / 100
      const daily_interest = loan.outstanding_balance * daily_rate

      // Log daily interest (you can store this in a separate table)
      console.log(`Loan ${loan.loan_number}: Daily Interest = ${daily_interest}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: loans.length,
        message: 'Daily interest calculated successfully' 
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

#### 4. Send Payment Reminders (Cron Job)
```typescript
// supabase/functions/send-payment-reminders/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Get schedules due in 3 days
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const { data: schedules, error } = await supabase
      .from('loan_schedules')
      .select(`
        *,
        loan:loans (
          loan_number,
          customer:customers (
            first_name,
            last_name,
            phone
          )
        )
      `)
      .eq('status', 'pending')
      .eq('due_date', threeDaysFromNow.toISOString().split('T')[0])

    if (error) throw error

    for (const schedule of schedules) {
      const customer = schedule.loan.customer
      const message = `Hi ${customer.first_name}, this is a reminder that your payment of PHP ${schedule.total_amount} for Loan ${schedule.loan.loan_number} is due on ${schedule.due_date}. Thank you!`

      // Call send-sms function
      await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          phone: customer.phone,
          message: message
        })
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_sent: schedules.length 
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

### Cron Job Configuration
```toml
# supabase/config.toml

# Schedule payment reminders daily at 9 AM
[[edge_functions]]
name = "send-payment-reminders"
schedule = "0 9 * * *"

# Calculate daily interest at midnight
[[edge_functions]]
name = "daily-interest-calculation"
schedule = "0 0 * * *"
```

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Foundation & Setup (Months 1-3)

**Week 1-2: Legal & Business Setup**
- ✅ Complete SEC registration
- ✅ Obtain Certificate of Authority
- ✅ Register with BIR, SSS, PhilHealth, Pag-IBIG
- ✅ Secure Mayor's Permit and Barangay Clearance
- ✅ Open corporate bank accounts

**Week 3-4: Development Environment**
- ✅ Setup monorepo structure (pnpm + Turborepo)
- ✅ Initialize Supabase project
- ✅ Setup version control (GitHub)
- ✅ Configure CI/CD pipelines (GitHub Actions)
- ✅ Setup development, staging, production environments

**Week 5-8: Database & Authentication**
- ✅ Design and implement database schema
- ✅ Create all tables, indexes, relationships
- ✅ Setup Row Level Security policies
- ✅ Create database triggers and functions
- ✅ Implement authentication system
- ✅ Setup role-based access control
- ✅ Create seed data for testing

**Week 9-12: Core Dashboard Development**
- ✅ Initialize Next.js dashboard app
- ✅ Setup Tailwind CSS + shadcn/ui
- ✅ Implement authentication pages (login, forgot password)
- ✅ Create main dashboard layout with navigation
- ✅ Build user management module
- ✅ Build branch management module
- ✅ Implement basic customer registration
- ✅ Setup Supabase client integration

**Deliverables**:
- Legal compliance documents
- Fully setup development environment
- Database schema with RLS policies
- Basic admin dashboard with auth

**Team Required**:
- 1 Project Manager
- 1 Full-stack Developer (Lead)
- 1 Frontend Developer
- 1 DevOps Engineer (part-time)
- 1 Legal/Compliance Officer
- 1 UI/UX Designer

**Budget**: PHP 1,500,000 - 2,000,000

---

### Phase 2: Core Lending Features (Months 4-6)

Month 4: Loan Product & Customer Management

✅ Build loan product configuration module
✅ Complete customer management (CRUD)
✅ Implement KYC document upload to Supabase Storage
✅ Build customer search and filtering
✅ Create customer profile page
✅ Implement credit score display

Month 5: Loan Origination System

✅ Build multi-step loan application form
✅ Implement EMI calculation Edge Function
✅ Create loan approval workflow
✅ Build loan schedule generation
✅ Implement document generation (loan agreement)
✅ Create loan disbursement interface
✅ Build loan portfolio view

Month 6: Payment & Reporting

✅ Create payment collection interface
✅ Implement payment allocation logic
✅ Build receipt generation
✅ Create basic reports dashboard
✅ Implement loan status tracking
✅ Build overdue loan alerts
✅ Create branch performance reports

Deliverables:

Complete loan origination system
Customer management with KYC
Payment collection system
Basic reporting

Team Required:

Same as Phase 1
Add 1 Backend Developer (for Edge Functions)

Budget: PHP 2,000,000 - 2,800,000

Phase 3: Mobile App & Collection (Months 7-9)
Month 7: Mobile App Foundation

✅ Initialize React Native Expo project
✅ Setup navigation (Expo Router)
✅ Implement authentication flow
✅ Create home dashboard
✅ Build offline database (SQLite)
✅ Implement Supabase sync logic

Month 8: Collection Features

✅ Build customer search in mobile
✅ Create collection interface
✅ Implement offline payment capture
✅ Build receipt generation (mobile)
✅ Add camera for photo capture
✅ Implement GPS tracking
✅ Create daily collection routes

Month 9: Integration & Testing

✅ Payment gateway integration (GCash, PayMaya)
✅ SMS notification Edge Function
✅ Implement automated reminders
✅ Build sync conflict resolution
✅ Comprehensive testing (mobile + web)
✅ Performance optimization

Deliverables:

Fully functional field officer mobile app
Offline-first collection system
Payment gateway integrations
Automated SMS notifications

Team Required:

Add 1 Mobile Developer
Add 1 QA Engineer

Budget: PHP 1,800,000 - 2,500,000

Phase 4: Advanced Features & AI (Months 10-12)
Month 10: Advanced Analytics

✅ Build advanced analytics dashboard
✅ Implement data visualization
✅ Create portfolio analytics
✅ Build predictive reports
✅ Implement export functionality (Excel, PDF)
✅ Create executive dashboard

Month 11: AI & Automation

✅ Implement AI credit scoring Edge Function
✅ Build risk assessment model
✅ Create automated late payment penalties
✅ Implement intelligent payment reminders
✅ Build fraud detection alerts
✅ Create loan recommendation system

Month 12: Compliance & Security

✅ Implement comprehensive audit logging
✅ Build SEC compliance reports
✅ Create data export for regulatory filing
✅ Implement data retention policies
✅ Security audit and penetration testing
✅ Performance optimization
✅ Load testing

Deliverables:

Advanced analytics and reporting
AI-powered credit scoring
Full regulatory compliance
Security hardened system

Team Required:

Add 1 Data Scientist (AI/ML)
Add 1 Security Specialist (consultant)

Budget: PHP 2,500,000 - 3,500,000

Phase 5: Launch Preparation (Months 13-15)
Month 13: User Acceptance Testing

✅ Pilot launch with 5-10 test customers
✅ Gather user feedback
✅ Bug fixes and refinements
✅ Performance tuning
✅ Documentation completion

Month 14: Training & Onboarding

✅ Create training materials
✅ Conduct staff training sessions
✅ Create user guides and videos
✅ Setup helpdesk system
✅ Prepare marketing materials

Month 15: Production Launch

✅ Final security audit
✅ Production deployment
✅ Gradual rollout to branches
✅ Monitor system performance
✅ 24/7 support during launch week
✅ Post-launch optimization

Deliverables:

Fully tested and production-ready system
Trained staff
Complete documentation
Successful launch

Team Required:

Add 1 Customer Support Manager
Add 2 Customer Support Representatives
Add 1 Training Specialist

Budget: PHP 1,200,000 - 2,000,000

Phase 6: Scaling & Enhancement (Months 16+)
Ongoing Development:

White-label customer mobile apps
Advanced fraud detection
Open banking integration
Multi-currency support (for OFW remittances)
Blockchain for transaction transparency
AI chatbot for customer support
Insurance product integration
Microinsurance offerings
Savings account management
Investment management module

Continuous Improvement:

Regular security updates
Feature enhancements based on feedback
Performance optimization
Scaling infrastructure as needed


8. COST BREAKDOWN
Initial Setup Costs
ItemEstimated Cost (PHP)SEC Registration & CA50,000 - 100,000Minimum Paid-in Capital1,000,000Legal & Compliance200,000 - 500,000Office Setup300,000 - 800,000Total Initial1,550,000 - 2,400,000
Development Costs (15 months)
PhaseDurationBudget Range (PHP)Phase 1: Foundation3 months1,500,000 - 2,000,000Phase 2: Core Features3 months2,000,000 - 2,800,000Phase 3: Mobile & Collection3 months1,800,000 - 2,500,000Phase 4: Advanced & AI3 months2,500,000 - 3,500,000Phase 5: Launch3 months1,200,000 - 2,000,000Total Development15 months9,000,000 - 12,800,000
Supabase Subscription Costs
PlanMonthly CostWhen to UseFree Tier$0Development & TestingPro$25 (~PHP 1,400)Pilot & Early ProductionTeam$599 (~PHP 33,500)Full Production (100+ users)EnterpriseCustomLarge Scale (1000+ users)
Monthly Operational Costs (After Launch)
ItemMonthly Cost (PHP)Supabase Pro1,400 - 33,500Development Team (maintenance)300,000 - 500,000Support Team100,000 - 200,000SMS Credits20,000 - 50,000Payment Gateway FeesVariable (2-3% of transactions)Monitoring & Tools10,000 - 30,000Office & Admin100,000 - 300,000Total Monthly531,400 - 1,113,500
Total Investment (First 15 Months)
Estimated Range: PHP 11,000,000 - 16,000,000
Breakdown:

Initial Setup: 1.5M - 2.4M
Development (15 months): 9M - 12.8M
Operations (avg 3 months): 1.5M - 3.3M


9. TECHNOLOGY ADVANTAGES
Why Supabase?
Cost Savings:

❌ No need for dedicated backend developers (initially)
❌ No DevOps engineer for backend infrastructure
❌ No database administrator
❌ No server costs (included in Supabase)
✅ Savings: ~PHP 500,000 - 800,000 per month

Time Savings:

Build MVP in 9 months instead of 15 months
Auto-generated APIs save weeks of development
Built-in auth saves 2-3 weeks
Real-time features work out of the box

Developer Experience:

TypeScript end-to-end
Auto-generated types from database
Real-time subscriptions with one line of code
Excellent documentation

Scalability:

Handle 100,000+ users without code changes
Auto-scaling infrastructure
Global CDN included
Built-in caching

Security:

Row Level Security for multi-tenancy
Automatic backups
Point-in-time recovery
SOC 2 Type 2 compliant


10. DEPLOYMENT ARCHITECTURE
Production Environment
┌─────────────────────────────────────────────────┐
│           Users (Web & Mobile)                   │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│        Cloudflare CDN / WAF                      │
│        - DDoS Protection                         │
│        - SSL/TLS Termination                     │
│        - Caching                                 │
└────────────┬────────────────────────────────────┘
             │
       ┌─────┴─────┐
       │           │
       ▼           ▼
┌─────────────┐  ┌──────────────────┐
│   Vercel    │  │    Supabase      │
│  (Next.js)  │  │   (Full Stack)   │
│             │  │                  │
│ - Dashboard │  │ - PostgreSQL     │
│ - Edge Fns  │  │ - Auth           │
│ - SSR/ISR   │  │ - Storage        │
└─────────────┘  │ - Edge Functions │
                 │ - Realtime       │
                 └──────────────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Payment  │    │   SMS    │    │  Credit  │
    │ Gateways │    │ Provider │    │  Bureau  │
    └──────────┘    └──────────┘    └──────────┘
Infrastructure Details
Frontend (Next.js Dashboard):
Platform: Vercel
- Auto-scaling
- Edge caching
- Automatic SSL
- Preview deployments per PR
- Zero-config deployment
- Global CDN

Alternative: AWS Amplify, Netlify
Mobile App Distribution:
iOS: Apple App Store
- Enterprise Distribution (for internal use)
- TestFlight for beta testing
- EAS Build for compilation

Android: Google Play Store
- Internal testing track
- Closed beta testing
- EAS Build for compilation

Alternative: Direct APK distribution for Android
Backend (Supabase):
Hosting: Supabase Cloud
- AWS infrastructure
- Multi-region support
- Automatic backups
- Point-in-time recovery
- Connection pooling
- Auto-scaling database

Regions:
- Primary: ap-southeast-1 (Singapore) - closest to PH
- Backup: Multi-region setup for disaster recovery
Monitoring & Observability:
Application Monitoring:
- Sentry (Error tracking)
- LogRocket (Session replay)
- Vercel Analytics (Web vitals)

Infrastructure Monitoring:
- Supabase Dashboard (Built-in)
- Better Stack (Uptime monitoring)
- Grafana Cloud (Advanced metrics)

Alerting:
- PagerDuty or Opsgenie
- SMS alerts for critical issues
- Email notifications

11. SECURITY ARCHITECTURE
Data Security
Encryption:
At Rest:
- Supabase: AES-256 encryption
- Storage buckets: Encrypted by default
- Backups: Encrypted

In Transit:
- TLS 1.3 for all connections
- Certificate pinning in mobile apps
- Secure WebSocket (WSS) for real-time
Authentication:
Method: JWT with refresh tokens
- Access token expiry: 1 hour
- Refresh token expiry: 7 days
- Secure HTTP-only cookies
- Multi-factor authentication (optional)
- Biometric auth for mobile (fingerprint/face)
Authorization:
Row Level Security (RLS):
- Database-level security
- Per-user/per-role data isolation
- Cannot be bypassed by client
- Policies enforced at PostgreSQL level

API Security:
- Rate limiting (100 requests/minute per user)
- API key rotation
- Request signing
- IP whitelisting (for admin panel)
Compliance
Data Privacy Act (RA 10173):
Implemented:
✅ User consent management
✅ Data minimization
✅ Purpose limitation
✅ Right to access data
✅ Right to rectification
✅ Right to erasure ("right to be forgotten")
✅ Data portability
✅ Data breach notification procedures
✅ Privacy policy published
✅ Data retention policies

Technical Controls:
- Audit logging of all data access
- Encrypted backups
- Secure data disposal
- Access controls
SEC Compliance:
✅ Accurate financial reporting
✅ Loan documentation standards
✅ Interest rate transparency
✅ Fair debt collection practices
✅ Annual reporting capabilities
✅ Audit trail for all transactions
Anti-Money Laundering (AMLA):
✅ Customer identification (KYC)
✅ Transaction monitoring
✅ Suspicious activity reporting
✅ Record keeping (5 years minimum)
✅ Customer due diligence

12. DISASTER RECOVERY & BUSINESS CONTINUITY
Backup Strategy
Database Backups (Supabase):
- Automated daily backups
- Point-in-time recovery (30 days)
- Off-site backup storage
- Backup encryption
- Regular restore testing

File Storage Backups:
- Cross-region replication
- Versioning enabled
- 30-day retention

Mobile Offline Data:
- SQLite local backup
- Auto-sync when online
- Conflict resolution
Recovery Objectives
RPO (Recovery Point Objective): < 1 hour
- Maximum acceptable data loss

RTO (Recovery Time Objective): < 4 hours
- Maximum acceptable downtime

High Availability:
- 99.9% uptime SLA
- Multi-AZ deployment
- Automatic failover
Incident Response Plan
1. Detection (< 5 minutes)
   - Automated monitoring alerts
   - 24/7 on-call engineer

2. Assessment (< 15 minutes)
   - Severity classification
   - Impact analysis

3. Communication (< 30 minutes)
   - Notify stakeholders
   - Status page updates

4. Resolution (< 4 hours)
   - Execute recovery procedures
   - Restore services

5. Post-Mortem (< 48 hours)
   - Root cause analysis
   - Prevention measures
   - Documentation update

13. DEVELOPMENT WORKFLOW
Git Workflow
Branches:
main (production)
├── staging (testing)
└── develop (active development)
    ├── feature/loan-approval
    ├── feature/mobile-collections
    └── bugfix/payment-calculation

Process:
1. Create feature branch from develop
2. Develop and test locally
3. Create Pull Request to develop
4. Code review (required)
5. Automated tests run
6. Merge to develop
7. Deploy to staging
8. QA testing
9. Merge to main
10. Deploy to production
CI/CD Pipeline
yaml# .github/workflows/dashboard-deploy.yml

name: Deploy Dashboard

on:
  push:
    branches: [main, staging]
    paths:
      - 'apps/dashboard/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Type check
        run: pnpm --filter dashboard type-check
      - name: Lint
        run: pnpm --filter dashboard lint
      - name: Test
        run: pnpm --filter dashboard test
      - name: Build
        run: pnpm --filter dashboard build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

14. TESTING STRATEGY
Testing Pyramid
                    ▲
                   ╱ ╲
                  ╱ E2E╲
                 ╱Tests ╲
                ╱────────╲
               ╱Integration╲
              ╱   Tests     ╲
             ╱──────────────╲
            ╱  Unit Tests    ╲
           ╱─────────────────╲
          
Unit Tests (70%):
- Business logic
- Utility functions
- Calculations (EMI, interest)
- Form validations

Integration Tests (20%):
- API endpoints
- Database operations
- Supabase client
- Edge Functions

E2E Tests (10%):
- Critical user journeys
- Loan application flow
- Payment collection
- Login/authentication
Test Coverage
Target Coverage:
- Unit tests: 80%+
- Integration: 60%+
- E2E: Critical paths only

Tools:
- Vitest (unit tests)
- Playwright (E2E web)
- Detox (E2E mobile)
- Testing Library (React components)

15. PERFORMANCE OPTIMIZATION
Frontend Performance
Next.js Optimizations:
✅ Static Site Generation (SSG) for public pages
✅ Incremental Static Regeneration (ISR) for reports
✅ Server-Side Rendering (SSR) for dynamic content
✅ Image optimization (next/image)
✅ Code splitting (automatic)
✅ Route prefetching
✅ React Server Components

Mobile Optimizations:
✅ Lazy loading components
✅ Image caching
✅ Offline-first architecture
✅ Optimized SQLite queries
✅ Background sync
✅ Reduced bundle size
Database Performance
PostgreSQL Optimizations:
✅ Proper indexing strategy
✅ Query optimization
✅ Connection pooling
✅ Materialized views for reports
✅ Partitioning large tables (payments, audit_logs)
✅ Regular VACUUM and ANALYZE

Caching Strategy:
✅ Supabase built-in caching
✅ Browser caching (Cache-Control headers)
✅ CDN caching (static assets)
✅ In-memory caching for frequently accessed data
API Performance
Target Metrics:
- API response time: < 200ms (p95)
- Page load time: < 2s (p95)
- Time to interactive: < 3s
- Mobile app startup: < 2s

Optimization Techniques:
✅ GraphQL for efficient data fetching
✅ Pagination (limit 50 records per page)
✅ Data compression (gzip)
✅ Edge caching
✅ Rate limiting to prevent abuse

16. KEY PERFORMANCE INDICATORS (KPIs)
Business KPIs
Portfolio Management:
- Total Active Loans
- Total Disbursed Amount
- Portfolio at Risk (PAR) - 30, 60, 90 days
- Collection Efficiency Ratio
- Loan Portfolio Yield
- Average Loan Size
- Average Tenure

Financial:
- Monthly Revenue
- Operating Expense Ratio
- Net Profit Margin
- Return on Assets (ROA)
- Cost per Loan

Customer Metrics:
- Number of Active Borrowers
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (CLV)
- Repeat Borrower Rate
- Customer Satisfaction Score
- Net Promoter Score (NPS)
Technical KPIs
System Performance:
- System Uptime (Target: 99.9%)
- API Response Time (Target: < 200ms)
- Page Load Time (Target: < 2s)
- Mobile App Crash Rate (Target: < 1%)
- Database Query Performance
- Error Rate (Target: < 0.1%)

Operations:
- Daily Active Users (DAU)
- Loans Processed per Day
- Payments Collected per Day
- Average Loan Processing Time
- Data Sync Success Rate
- SMS Delivery Rate

17. RISK MITIGATION
Technical Risks
RiskImpactProbabilityMitigationSupabase outageHighLowMulti-region backup, regular backups, incident response planData breachCriticalLowEncryption, RLS, security audits, penetration testingMobile offline sync conflictsMediumMediumConflict resolution logic, timestamp-based mergingThird-party API failuresMediumMediumRetry logic, fallback mechanisms, circuit breakersDatabase performance degradationHighMediumQuery optimization, proper indexing, monitoring
Business Risks
RiskImpactProbabilityMitigationRegulatory changesHighMediumCompliance officer, regular policy reviewsHigh default ratesCriticalMediumRobust credit scoring, diversified portfolio, insuranceStaff turnoverMediumHighDocumentation, knowledge transfer, training programsFraud (internal/external)HighMediumDual authorization, audit trails, background checksCompetitionMediumHighContinuous innovation, excellent customer service
Operational Risks
RiskImpactProbabilityMitigationCash flow issuesHighMediumConservative growth, adequate reservesScalability challengesMediumMediumCloud infrastructure, load testingTraining gapsLowHighComprehensive training program, documentationPoor user adoptionHighLowUser-centered design, continuous feedback

18. SUCCESS METRICS (First Year)
Launch Targets (Month 15)
Pilot Phase (Month 13-14):
✅ 5-10 test customers
✅ 20-30 loans disbursed
✅ < 5 critical bugs
✅ 90%+ user satisfaction

Launch Month (Month 15):
✅ 50-100 customers onboarded
✅ 100-200 loans disbursed
✅ PHP 1M - 2M total disbursements
✅ System uptime > 99%
✅ < 10 support tickets per day
End of Year 1 Goals
Customers:
✅ 500 - 1,000 active borrowers
✅ 3 - 5 branches operational
✅ 80%+ customer retention rate
✅ NPS score > 50

Financial:
✅ PHP 10M - 20M total portfolio
✅ Collection efficiency > 95%
✅ PAR-30 < 5%
✅ Operational self-sustainability

Operational:
✅ 10 - 15 field officers using mobile app
✅ 500 - 1,000 payments collected per month
✅ < 30 minute average loan processing
✅ 99.9% system uptime

19. FUTURE ENHANCEMENTS (Post-Launch)
Phase 7: Customer Mobile Apps (Months 16-18)
White-label mobile apps for customers:
✅ Loan application submission
✅ Document upload
✅ Loan status tracking
✅ Payment history
✅ Make payments (GCash, PayMaya)
✅ Payment reminders
✅ Customer support chat
✅ Loyalty program

Customization per lender:
- Custom branding (logo, colors)
- Custom loan products
- Unique app name
- Separate app store listings
Phase 8: Advanced AI Features (Months 19-21)
Machine Learning:
✅ Advanced credit scoring model
✅ Default prediction
✅ Optimal loan amount recommendation
✅ Dynamic interest rate pricing
✅ Fraud detection
✅ Customer segmentation
✅ Churn prediction

Automation:
✅ Automated loan approval (low-risk)
✅ Intelligent collection strategies
✅ Predictive cash flow management
Phase 9: Ecosystem Expansion (Months 22+)
New Products:
✅ Micro-insurance integration
✅ Micro-savings accounts
✅ Investment products
✅ Remittance services (OFW)
✅ Digital wallet

Partnerships:
✅ Credit bureau integration (CIC)
✅ Open banking (when available in PH)
✅ E-commerce financing
✅ Utility bill payments
✅ Government benefit disbursement

20. SUPPORT & MAINTENANCE
Support Structure
Tier 1: Customer Support
- Email: support@debtnote.ph
- Hours: 8 AM - 8 PM (Mon-Sat)
- Response time: < 4 hours
- Handle: Basic queries, password resets, how-tos

Tier 2: Technical Support
- Email: tech@debtnote.ph
- Hours: 24/7 (on-call rotation)
- Response time: < 1 hour
- Handle: Bugs, system issues, integrations

Tier 3: Engineering
- Emergency hotline
- 24/7 availability
- Response time: < 15 minutes
- Handle: Critical system failures, security incidents
Maintenance Windows
Regular Maintenance:
- Schedule: Every Sunday 2 AM - 4 AM
- Duration: < 2 hours
- Notification: 48 hours advance
- Activities: Database optimization, backups, updates

Emergency Maintenance:
- As needed for critical issues
- Notification: Immediate (status page)
- Post-mortem report within 24 hours

21. DOCUMENTATION
Technical Documentation
Architecture Docs:
✅ System architecture diagrams
✅ Database schema documentation
✅ API documentation (OpenAPI/Swagger)
✅ Deployment guides
✅ Security policies

Code Documentation:
✅ Inline code comments
✅ README files for each app
✅ Component documentation (Storybook)
✅ Edge Function documentation
✅ TypeScript types and interfaces
User Documentation
Admin Users:
✅ User guides (PDF + online)
✅ Video tutorials
✅ FAQ section
✅ Process flowcharts
✅ Best practices

Field Officers:
✅ Mobile app user guide
✅ Collection procedures
✅ Troubleshooting guide
✅ Quick reference cards

Customers:
✅ Loan application guide
✅ Payment methods guide
✅ FAQ
✅ Terms and conditions

22. NEXT STEPS (Immediate Actions)
Week 1-2: Project Kickoff
✅ Form core team (hire key personnel)
✅ Engage legal counsel for SEC registration
✅ Prepare business plan and financial projections
✅ Secure initial funding
✅ Reserve business name with SEC
✅ Open corporate bank account
✅ Setup project management tools (Jira, Notion)
✅ Create project charter and timeline
Week 3-4: Technical Setup
✅ Create GitHub organization
✅ Initialize monorepo with pnpm + Turborepo
✅ Setup Supabase project (free tier for dev)
✅ Configure development environments
✅ Create initial project structure
✅ Setup CI/CD pipelines
✅ Configure code quality tools (ESLint, Prettier)
✅ Create development documentation
Month 2: Core Development Begins
✅ Complete SEC registration process
✅ Design database schema
✅ Create initial migrations
✅ Setup authentication
✅ Build basic dashboard layout
✅ Weekly sprint planning and reviews
✅ Daily standups

APPENDIX
A. Recommended Service Providers (Philippines)
Cloud & Infrastructure:

Supabase (Backend)
Vercel (Frontend hosting)
AWS (Additional services if needed)
Cloudflare (CDN, DDoS protection)

Communication:

Semaphore (SMS - local provider)
Vonage/Nexmo (SMS - international)
SendGrid (Email)
Twilio (Backup SMS)

Payments:

PayMongo (Payment gateway)
Xendit (Payment gateway)
GCash (E-wallet)
PayMaya/Maya (E-wallet)
InstaPay/PESONet (Bank transfers)

Monitoring & Analytics:

Sentry (Error tracking)
Better Stack (Uptime monitoring)
Google Analytics (Web analytics)
Mixpanel (Product analytics)

Development Tools:

GitHub (Version control)
Vercel (Deployment)
EAS (Expo Application Services)
Bruno/Postman (API testing)

B. Philippine Microfinance Resources
Government Agencies:

Securities and Exchange Commission (SEC)
Bangko Sentral ng Pilipinas (BSP)
Bureau of Internal Revenue (BIR)
Department of Trade and Industry (DTI)

Industry Associations:

Microfinance Council of the Philippines, Inc. (MCPI)
Philippine Coalition for Microfinance Standards (PCMSI)
National Credit Council (NCC)

C. Sample Loan Products
1. Micro Business Loan
   - Amount: PHP 5,000 - 50,000
   - Tenure: 6 - 12 months
   - Interest: 2% - 3% monthly (declining)
   - Purpose: Small business capital

2. Emergency Loan
   - Amount: PHP 1,000 - 10,000
   - Tenure: 1 - 3 months
   - Interest: 3% - 5% monthly (flat)
   - Purpose: Medical, education, emergencies

3. Salary Loan
   - Amount: PHP 10,000 - 100,000
   - Tenure: 6 - 24 months
   - Interest: 1.5% - 2.5% monthly
   - Purpose: Personal needs

4. Agricultural Loan
   - Amount: PHP 20,000 - 200,000
   - Tenure: 6 - 18 months (seasonal)
   - Interest: 1.5% - 2% monthly
   - Purpose: Farm inputs, equipment
D. Key Regulations Reference
Primary Laws:
- RA 9474: Lending Company Regulation Act of 2007
- RA 10173: Data Privacy Act of 2012
- RA 3765: Truth in Lending Act
- RA 7394: Consumer Act of the Philippines
- RA 10693: Microfinance NGO Act

BSP Circulars:
- Manual of Regulations for Banks (MORB)
- Microfinance lending guidelines
- Interest rate regulations

SEC Guidelines:
- Lending company registration procedures
- Reportorial requirements
- Fair debt collection practices

CONCLUSION
This updated architecture leverages Supabase as a modern, cost-effective Backend-as-a-Service solution, enabling rapid development while maintaining enterprise-grade security and compliance. The monorepo structure with Next.js and React Native Expo ensures code reusability and a unified development experience.
Key Advantages of This Stack:

Faster Time to Market: 9-12 months vs 15-18 months with custom backend
Lower Costs: ~40% reduction in development and infrastructure costs
Easier Scaling: Built-in scalability from day one
Better Security: Database-level security with RLS
Full Compliance: Meets all Philippine regulatory requirements

Critical Success Factors:

✅ Strong regulatory compliance from day one
✅ User-friendly interface for low-tech literacy users
✅ Reliable offline capabilities for field officers
✅ Fast loan processing (< 30 minutes)
✅ Accurate automated calculations
✅ Comprehensive audit trails
✅ Excellent customer support

Ready to transform microfinance lending in the Philippines! 🚀

Document Version: 2.0 (Supabase Architecture)
Last Updated: October 2025
Next Review: Quarterly or upon major changes# Debt Note - Updated System Architecture & Roadmap