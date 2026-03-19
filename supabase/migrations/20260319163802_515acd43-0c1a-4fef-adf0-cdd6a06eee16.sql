-- Fix employee_contracts RLS - currently only has SELECT
DROP POLICY IF EXISTS "all" ON public.employee_contracts;
CREATE POLICY "Allow all access to employee_contracts"
ON public.employee_contracts
FOR ALL
USING (true)
WITH CHECK (true);