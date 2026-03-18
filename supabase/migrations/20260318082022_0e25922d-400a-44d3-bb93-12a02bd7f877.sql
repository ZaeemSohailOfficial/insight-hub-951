
-- Client categories
CREATE TABLE public.client_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Briefcase',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to client_categories" ON public.client_categories FOR ALL USING (true) WITH CHECK (true);

-- Employee categories
CREATE TABLE public.employee_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Briefcase',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to employee_categories" ON public.employee_categories FOR ALL USING (true) WITH CHECK (true);

-- Expense categories
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'one-time',
  icon TEXT NOT NULL DEFAULT 'Briefcase',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to expense_categories" ON public.expense_categories FOR ALL USING (true) WITH CHECK (true);

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  categories TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'in-progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- Client contracts
CREATE TABLE public.client_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  timeline TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  budget NUMERIC NOT NULL DEFAULT 0,
  costing NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  mou_details TEXT NOT NULL DEFAULT '',
  mou_files JSONB NOT NULL DEFAULT '[]',
  is_renewal BOOLEAN NOT NULL DEFAULT false,
  renewal_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to client_contracts" ON public.client_contracts FOR ALL USING (true) WITH CHECK (true);

-- Employees
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  categories TEXT[] NOT NULL DEFAULT '{}',
  salary NUMERIC NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  mou_details TEXT NOT NULL DEFAULT '',
  mou_files JSONB NOT NULL DEFAULT '[]',
  additional_info TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

-- Employee contracts
CREATE TABLE public.employee_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  salary NUMERIC NOT NULL DEFAULT 0,
  mou_details TEXT NOT NULL DEFAULT '',
  mou_files JSONB NOT NULL DEFAULT '[]',
  is_renewal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to employee_contracts" ON public.employee_contracts FOR ALL USING (true) WITH CHECK (true);

-- Personal expenses
CREATE TABLE public.personal_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  details TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  invoice_files JSONB NOT NULL DEFAULT '[]',
  date TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to personal_expenses" ON public.personal_expenses FOR ALL USING (true) WITH CHECK (true);

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_data_url TEXT,
  title TEXT NOT NULL DEFAULT 'INVOICE',
  company_name TEXT NOT NULL DEFAULT '',
  company_type TEXT NOT NULL DEFAULT '',
  company_email TEXT NOT NULL DEFAULT '',
  company_phone TEXT NOT NULL DEFAULT '',
  company_address TEXT NOT NULL DEFAULT '',
  invoice_number TEXT NOT NULL DEFAULT '',
  invoice_date TEXT NOT NULL DEFAULT '',
  client_brand TEXT NOT NULL DEFAULT '',
  client_owner TEXT NOT NULL DEFAULT '',
  client_cnic TEXT NOT NULL DEFAULT '',
  client_account TEXT NOT NULL DEFAULT '',
  client_address TEXT NOT NULL DEFAULT '',
  total_cost NUMERIC NOT NULL DEFAULT 0,
  founder_name TEXT NOT NULL DEFAULT '',
  founder_cnic TEXT NOT NULL DEFAULT '',
  founder_account TEXT NOT NULL DEFAULT '',
  payment_terms TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

-- Invoice services
CREATE TABLE public.invoice_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  service TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoice_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to invoice_services" ON public.invoice_services FOR ALL USING (true) WITH CHECK (true);

-- Task lists
CREATE TABLE public.task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to task_lists" ON public.task_lists FOR ALL USING (true) WITH CHECK (true);

-- Task items
CREATE TABLE public.task_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_list_id UUID NOT NULL REFERENCES public.task_lists(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.task_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to task_items" ON public.task_items FOR ALL USING (true) WITH CHECK (true);
