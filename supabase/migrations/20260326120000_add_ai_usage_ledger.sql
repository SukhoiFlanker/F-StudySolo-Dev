CREATE TABLE IF NOT EXISTS public.ss_ai_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    source_type text NOT NULL CHECK (source_type IN ('assistant', 'workflow')),
    source_subtype text NOT NULL,
    conversation_id uuid NULL REFERENCES public.ss_ai_conversations(id) ON DELETE SET NULL,
    message_id uuid NULL REFERENCES public.ss_ai_messages(id) ON DELETE SET NULL,
    workflow_id uuid NULL REFERENCES public.ss_workflows(id) ON DELETE SET NULL,
    workflow_run_id uuid NULL REFERENCES public.ss_workflow_runs(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'running',
    started_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    finished_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_ss_ai_requests_user_started
    ON public.ss_ai_requests (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ss_ai_requests_source_started
    ON public.ss_ai_requests (source_type, source_subtype, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ss_ai_requests_workflow_run
    ON public.ss_ai_requests (workflow_run_id);

ALTER TABLE public.ss_ai_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY ss_ai_requests_select_own
    ON public.ss_ai_requests
    FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY ss_ai_requests_insert_own
    ON public.ss_ai_requests
    FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY ss_ai_requests_update_own
    ON public.ss_ai_requests
    FOR UPDATE
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);


CREATE TABLE IF NOT EXISTS public.ss_ai_usage_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid NOT NULL REFERENCES public.ss_ai_requests(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    source_type text NOT NULL CHECK (source_type IN ('assistant', 'workflow')),
    source_subtype text NOT NULL,
    provider text NOT NULL,
    model text NOT NULL,
    node_id text NULL,
    attempt_index integer NOT NULL DEFAULT 1,
    is_fallback boolean NOT NULL DEFAULT false,
    status text NOT NULL,
    latency_ms integer NULL,
    input_tokens integer NOT NULL DEFAULT 0,
    output_tokens integer NOT NULL DEFAULT 0,
    reasoning_tokens integer NOT NULL DEFAULT 0,
    cached_tokens integer NOT NULL DEFAULT 0,
    total_tokens integer NOT NULL DEFAULT 0,
    cost_amount_usd numeric(18,8) NOT NULL DEFAULT 0,
    provider_request_id text NULL,
    started_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    finished_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_ss_ai_usage_events_request_started
    ON public.ss_ai_usage_events (request_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ss_ai_usage_events_user_started
    ON public.ss_ai_usage_events (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ss_ai_usage_events_source_started
    ON public.ss_ai_usage_events (source_type, source_subtype, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ss_ai_usage_events_provider_model_started
    ON public.ss_ai_usage_events (provider, model, started_at DESC);

ALTER TABLE public.ss_ai_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY ss_ai_usage_events_select_own
    ON public.ss_ai_usage_events
    FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY ss_ai_usage_events_insert_own
    ON public.ss_ai_usage_events
    FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY ss_ai_usage_events_update_own
    ON public.ss_ai_usage_events
    FOR UPDATE
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);


CREATE TABLE IF NOT EXISTS public.ss_ai_usage_minute (
    minute_bucket timestamptz NOT NULL,
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    source_type text NOT NULL CHECK (source_type IN ('assistant', 'workflow')),
    source_subtype text NOT NULL,
    provider text NOT NULL,
    model text NOT NULL,
    logical_requests integer NOT NULL DEFAULT 0,
    provider_calls integer NOT NULL DEFAULT 0,
    successful_provider_calls integer NOT NULL DEFAULT 0,
    total_tokens integer NOT NULL DEFAULT 0,
    total_cost_usd numeric(18,8) NOT NULL DEFAULT 0,
    error_count integer NOT NULL DEFAULT 0,
    fallback_count integer NOT NULL DEFAULT 0,
    latency_ms_sum bigint NOT NULL DEFAULT 0,
    latency_ms_count integer NOT NULL DEFAULT 0,
    PRIMARY KEY (minute_bucket, user_id, source_type, source_subtype, provider, model)
);

CREATE INDEX IF NOT EXISTS idx_ss_ai_usage_minute_user_bucket
    ON public.ss_ai_usage_minute (user_id, minute_bucket DESC);

CREATE INDEX IF NOT EXISTS idx_ss_ai_usage_minute_source_bucket
    ON public.ss_ai_usage_minute (source_type, source_subtype, minute_bucket DESC);

ALTER TABLE public.ss_ai_usage_minute ENABLE ROW LEVEL SECURITY;

CREATE POLICY ss_ai_usage_minute_select_own
    ON public.ss_ai_usage_minute
    FOR SELECT
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY ss_ai_usage_minute_insert_own
    ON public.ss_ai_usage_minute
    FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY ss_ai_usage_minute_update_own
    ON public.ss_ai_usage_minute
    FOR UPDATE
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);


CREATE OR REPLACE FUNCTION public.fn_ss_ai_usage_minute_increment(
    p_minute_bucket timestamptz,
    p_user_id uuid,
    p_source_type text,
    p_source_subtype text,
    p_provider text,
    p_model text,
    p_logical_requests integer DEFAULT 0,
    p_provider_calls integer DEFAULT 0,
    p_successful_provider_calls integer DEFAULT 0,
    p_total_tokens integer DEFAULT 0,
    p_total_cost_usd numeric DEFAULT 0,
    p_error_count integer DEFAULT 0,
    p_fallback_count integer DEFAULT 0,
    p_latency_ms_sum bigint DEFAULT 0,
    p_latency_ms_count integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.ss_ai_usage_minute (
        minute_bucket,
        user_id,
        source_type,
        source_subtype,
        provider,
        model,
        logical_requests,
        provider_calls,
        successful_provider_calls,
        total_tokens,
        total_cost_usd,
        error_count,
        fallback_count,
        latency_ms_sum,
        latency_ms_count
    )
    VALUES (
        date_trunc('minute', p_minute_bucket),
        p_user_id,
        p_source_type,
        p_source_subtype,
        p_provider,
        p_model,
        p_logical_requests,
        p_provider_calls,
        p_successful_provider_calls,
        p_total_tokens,
        p_total_cost_usd,
        p_error_count,
        p_fallback_count,
        p_latency_ms_sum,
        p_latency_ms_count
    )
    ON CONFLICT (minute_bucket, user_id, source_type, source_subtype, provider, model)
    DO UPDATE SET
        logical_requests = ss_ai_usage_minute.logical_requests + EXCLUDED.logical_requests,
        provider_calls = ss_ai_usage_minute.provider_calls + EXCLUDED.provider_calls,
        successful_provider_calls = ss_ai_usage_minute.successful_provider_calls + EXCLUDED.successful_provider_calls,
        total_tokens = ss_ai_usage_minute.total_tokens + EXCLUDED.total_tokens,
        total_cost_usd = ss_ai_usage_minute.total_cost_usd + EXCLUDED.total_cost_usd,
        error_count = ss_ai_usage_minute.error_count + EXCLUDED.error_count,
        fallback_count = ss_ai_usage_minute.fallback_count + EXCLUDED.fallback_count,
        latency_ms_sum = ss_ai_usage_minute.latency_ms_sum + EXCLUDED.latency_ms_sum,
        latency_ms_count = ss_ai_usage_minute.latency_ms_count + EXCLUDED.latency_ms_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_ss_ai_usage_minute_increment(
    timestamptz,
    uuid,
    text,
    text,
    text,
    text,
    integer,
    integer,
    integer,
    integer,
    numeric,
    integer,
    integer,
    bigint,
    integer
) TO authenticated, service_role;
