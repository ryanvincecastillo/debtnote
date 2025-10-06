-- ============================================
-- LOANS TABLE
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
  total_amount DECIMAL(12,2) NOT NULL,
  monthly_installment DECIMAL(12,2),
  processing_fee DECIMAL(12,2) DEFAULT 0,
  
  -- Disbursement
  disbursement_amount DECIMAL(12,2),
  disbursement_date DATE,
  disbursement_method TEXT,
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

-- Indexes
CREATE INDEX idx_loans_customer ON public.loans(customer_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_branch ON public.loans(branch_id);
CREATE INDEX idx_loans_officer ON public.loans(loan_officer_id);
CREATE INDEX idx_loans_overdue ON public.loans(is_overdue) WHERE is_overdue = true;

-- Enable RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view loans in branch"
  ON public.loans FOR SELECT
  USING (
    branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid()) OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'accountant', 'auditor')
  );

CREATE POLICY "Officers can create loans"
  ON public.loans FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'loan_officer')
  );

CREATE POLICY "Managers can update loans"
  ON public.loans FOR UPDATE
  USING (
    (branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid()) AND 
     (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager')) OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Trigger
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- LOAN SCHEDULES TABLE (EMI Schedule)
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

-- Indexes
CREATE INDEX idx_loan_schedules_loan ON public.loan_schedules(loan_id);
CREATE INDEX idx_loan_schedules_due_date ON public.loan_schedules(due_date);
CREATE INDEX idx_loan_schedules_status ON public.loan_schedules(status);

-- Enable RLS
ALTER TABLE public.loan_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view loan schedules"
  ON public.loan_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.loans 
      WHERE loans.id = loan_schedules.loan_id 
      AND (loans.branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid()) OR 
           (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'))
    )
  );

-- Trigger
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.loan_schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PAYMENTS TABLE
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
  payment_reference TEXT,
  
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

-- Indexes
CREATE INDEX idx_payments_loan ON public.payments(loan_id);
CREATE INDEX idx_payments_customer ON public.payments(customer_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_payments_collected_by ON public.payments(collected_by);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view payments in branch"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.loans 
      WHERE loans.id = payments.loan_id 
      AND (loans.branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid()) OR 
           (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'accountant', 'auditor'))
    )
  );

CREATE POLICY "Officers can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'loan_officer', 'field_officer')
  );

-- Trigger
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
