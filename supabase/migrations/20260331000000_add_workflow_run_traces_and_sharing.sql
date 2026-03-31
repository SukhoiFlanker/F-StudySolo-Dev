-- Migration: Workflow Memory System
-- Adds node-level execution traces and run-level sharing controls
-- Date: 2026-03-31

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. New table: ss_workflow_run_traces — node-level execution records
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ss_workflow_run_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.ss_workflow_runs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,  -- denormalized for fast RLS queries
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  node_name TEXT NOT NULL,
  category TEXT,
  execution_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  input_snapshot TEXT,
  final_output TEXT,
  output_format TEXT,
  duration_ms INTEGER,
  model_route TEXT,
  is_parallel BOOLEAN DEFAULT FALSE,
  parallel_group_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.ss_workflow_run_traces IS 'Node-level execution records for workflow runs — the core of the Memory system';
COMMENT ON COLUMN public.ss_workflow_run_traces.user_id IS 'Denormalized from ss_workflow_runs for RLS performance';
COMMENT ON COLUMN public.ss_workflow_run_traces.input_snapshot IS 'Upstream output fed into this node (can be large for AI nodes)';
COMMENT ON COLUMN public.ss_workflow_run_traces.final_output IS 'Full output produced by this node';
COMMENT ON COLUMN public.ss_workflow_run_traces.duration_ms IS 'Execution wall-clock time in milliseconds';

-- Indexes
CREATE INDEX idx_ss_wf_run_traces_run_id ON public.ss_workflow_run_traces(run_id);
CREATE INDEX idx_ss_wf_run_traces_user_id ON public.ss_workflow_run_traces(user_id);
CREATE INDEX idx_ss_wf_run_traces_node_type ON public.ss_workflow_run_traces(node_type);

-- Enable RLS
ALTER TABLE public.ss_workflow_run_traces ENABLE ROW LEVEL SECURITY;

-- RLS: Owner can read own traces (using denormalized user_id for O(1) lookup)
CREATE POLICY ss_wf_run_traces_select_own
  ON public.ss_workflow_run_traces FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- RLS: Service-role inserts (backend uses service_role key)
CREATE POLICY ss_wf_run_traces_insert_service
  ON public.ss_workflow_run_traces FOR INSERT
  WITH CHECK (true);

-- RLS: Public access for shared runs
CREATE POLICY ss_wf_run_traces_select_shared
  ON public.ss_workflow_run_traces FOR SELECT
  USING (run_id IN (
    SELECT id FROM public.ss_workflow_runs
    WHERE is_shared = TRUE
  ));

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Extend ss_workflow_runs with sharing controls
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.ss_workflow_runs
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ;

-- RLS: Public access for shared runs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ss_workflow_runs'
      AND policyname = 'ss_workflow_runs_select_shared'
  ) THEN
    CREATE POLICY ss_workflow_runs_select_shared
      ON public.ss_workflow_runs FOR SELECT
      USING (is_shared = TRUE);
  END IF;
END $$;

-- Index for shared runs
CREATE INDEX IF NOT EXISTS idx_ss_wf_runs_is_shared
  ON public.ss_workflow_runs(is_shared)
  WHERE is_shared = TRUE;
