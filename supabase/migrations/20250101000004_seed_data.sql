-- ============================================
-- SEED DATA FOR DEVELOPMENT
-- ============================================

-- Insert a main branch
INSERT INTO public.branches (id, name, code, address, city, province, phone, email, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Main Branch', 'MAIN', '123 Main Street', 'Davao City', 'Davao del Sur', '+639123456789', 'main@debtnote.ph', true),
  ('00000000-0000-0000-0000-000000000002', 'North Branch', 'NORTH', '456 North Ave', 'Tagum City', 'Davao del Norte', '+639987654321', 'north@debtnote.ph', true);

-- Insert sample loan products
INSERT INTO public.loan_products (name, code, description, min_amount, max_amount, interest_rate, interest_calculation, min_tenure_months, max_tenure_months, repayment_frequency, processing_fee_percentage, is_active)
VALUES 
  ('Micro Business Loan', 'MBL', 'Small business capital for entrepreneurs', 5000, 50000, 2.5, 'declining', 6, 12, 'monthly', 2.0, true),
  ('Emergency Loan', 'EML', 'Quick cash for urgent needs', 1000, 10000, 3.0, 'flat', 1, 3, 'monthly', 3.0, true),
  ('Salary Loan', 'SAL', 'Personal loan for employees', 10000, 100000, 2.0, 'declining', 6, 24, 'monthly', 1.5, true),
  ('Agricultural Loan', 'AGL', 'Farm inputs and equipment financing', 20000, 200000, 1.8, 'declining', 6, 18, 'monthly', 1.0, true);

-- Note: Admin user will be created through Supabase Auth
-- After creating your first user via signup, run this to make them admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
