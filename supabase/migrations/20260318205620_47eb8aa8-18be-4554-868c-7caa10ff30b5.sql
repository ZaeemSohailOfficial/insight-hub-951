
-- Task folders
CREATE TABLE IF NOT EXISTS public.task_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.task_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to task_folders" ON public.task_folders FOR ALL TO public USING (true) WITH CHECK (true);

-- Task categories
CREATE TABLE IF NOT EXISTS public.task_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'Tag',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to task_categories" ON public.task_categories FOR ALL TO public USING (true) WITH CHECK (true);

-- Task phases
CREATE TABLE IF NOT EXISTS public.task_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_list_id uuid NOT NULL REFERENCES public.task_lists(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Phase 1',
  phase_number integer NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.task_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to task_phases" ON public.task_phases FOR ALL TO public USING (true) WITH CHECK (true);

-- Add columns to task_lists
ALTER TABLE public.task_lists
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES public.task_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.task_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

-- Add columns to task_items
ALTER TABLE public.task_items
  ADD COLUMN IF NOT EXISTS phase_id uuid REFERENCES public.task_phases(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS task_type text NOT NULL DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS repeat_interval text,
  ADD COLUMN IF NOT EXISTS custom_interval_days integer;
