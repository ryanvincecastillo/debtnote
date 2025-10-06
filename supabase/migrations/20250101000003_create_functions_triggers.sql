-- ============================================
-- FUNCTION: Generate Loan Number
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_loan_number()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_loan_number
  BEFORE INSERT ON public.loans
  FOR EACH ROW
  WHEN (NEW.loan_number IS NULL)
  EXECUTE FUNCTION public.generate_loan_number();

-- ============================================
-- FUNCTION: Generate Customer Code
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS TRIGGER AS $$
DECLARE
  branch_code TEXT;
  customer_count INTEGER;
  new_customer_code TEXT;
BEGIN
  -- Get branch code
  SELECT code INTO branch_code FROM public.branches WHERE id = NEW.branch_id;
  
  -- Count customers in branch
  SELECT COUNT(*) INTO customer_count 
  FROM public.customers 
  WHERE branch_id = NEW.branch_id;
  
  -- Generate: CUS-{BRANCH}-{NUMBER}
  new_customer_code := 'CUS-' || branch_code || '-' || 
                       LPAD((customer_count + 1)::TEXT, 6, '0');
  
  NEW.customer_code := new_customer_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_customer_code
  BEFORE INSERT ON public.customers
  FOR EACH ROW
  WHEN (NEW.customer_code IS NULL)
  EXECUTE FUNCTION public.generate_customer_code();

-- ============================================
-- FUNCTION: Generate Receipt Number
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
  payment_count INTEGER;
  new_receipt_number TEXT;
BEGIN
  -- Count payments for today
  SELECT COUNT(*) INTO payment_count 
  FROM public.payments 
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Generate: RCP-{YYYYMMDD}-{NUMBER}
  new_receipt_number := 'RCP-' || 
                       TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                       LPAD((payment_count + 1)::TEXT, 5, '0');
  
  NEW.receipt_number := new_receipt_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_receipt_number
  BEFORE INSERT ON public.payments
  FOR EACH ROW
  WHEN (NEW.receipt_number IS NULL)
  EXECUTE FUNCTION public.generate_receipt_number();

-- ============================================
-- FUNCTION: Update Loan Balance After Payment
-- ============================================
CREATE OR REPLACE FUNCTION public.update_loan_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.loans
    SET 
      total_paid = total_paid + NEW.amount,
      principal_paid = principal_paid + NEW.principal_paid,
      interest_paid = interest_paid + NEW.interest_paid,
      penalty_paid = penalty_paid + NEW.penalty_paid,
      outstanding_balance = total_amount - (total_paid + NEW.amount),
      status = CASE 
        WHEN (total_amount - (total_paid + NEW.amount)) <= 0 THEN 'fully_paid'
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = NEW.loan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loan_on_payment
  AFTER INSERT ON public.payments
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_loan_balance();

-- ============================================
-- FUNCTION: Calculate Outstanding Balance on Loan Insert
-- ============================================
CREATE OR REPLACE FUNCTION public.set_outstanding_balance()
RETURNS TRIGGER AS $$
BEGIN
  NEW.outstanding_balance := NEW.total_amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_loan_outstanding_balance
  BEFORE INSERT ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.set_outstanding_balance();

-- ============================================
-- FUNCTION: Get User Role Helper
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_branch()
RETURNS UUID AS $$
  SELECT branch_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
