-- ============================================
-- CUSTOMERS TABLE
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
  id_type TEXT,
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

-- Indexes
CREATE INDEX idx_customers_search ON public.customers USING GIN(search_vector);
CREATE INDEX idx_customers_branch ON public.customers(branch_id);
CREATE INDEX idx_customers_officer ON public.customers(assigned_officer_id);
CREATE INDEX idx_customers_status ON public.customers(status);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view customers in branch"
  ON public.customers FOR SELECT
  USING (
    branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid()) OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Officers can create customers"
  ON public.customers FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'loan_officer', 'field_officer')
  );

CREATE POLICY "Officers can update customers"
  ON public.customers FOR UPDATE
  USING (
    (branch_id = (SELECT branch_id FROM public.profiles WHERE id = auth.uid()) AND 
     (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager', 'loan_officer')) OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Trigger
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- LOAN PRODUCTS TABLE
-- ============================================
CREATE TABLE public.loan_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Loan Terms
  min_amount DECIMAL(12,2) NOT NULL,
  max_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
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

-- Enable RLS
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies (everyone can view active products)
CREATE POLICY "Users can view active loan products"
  ON public.loan_products FOR SELECT
  USING (is_active = true OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Admins can manage loan products"
  ON public.loan_products FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager'));

-- Trigger
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.loan_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
