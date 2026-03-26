import { authedFetch, parseApiError } from '@/services/api-client';
import type {
  UsageLiveResponse,
  UsageOverviewResponse,
  UsageSourceFilter,
  UsageTimeseriesResponse,
} from '@/types/usage';

async function usageFetch<T>(path: string, fallback: string): Promise<T> {
  const response = await authedFetch(path);
  if (!response.ok) {
    throw new Error(await parseApiError(response, fallback));
  }
  return response.json();
}

export function getUsageOverview(range: '24h' | '7d' = '24h') {
  return usageFetch<UsageOverviewResponse>(
    `/api/usage/overview?range=${range}`,
    '加载个人 AI 使用概览失败',
  );
}

export function getUsageLive(window: '5m' = '5m') {
  return usageFetch<UsageLiveResponse>(
    `/api/usage/live?window=${window}`,
    '加载个人实时使用情况失败',
  );
}

export function getUsageTimeseries(range: '24h' | '7d' = '24h', source: UsageSourceFilter = 'all') {
  return usageFetch<UsageTimeseriesResponse>(
    `/api/usage/timeseries?range=${range}&source=${source}`,
    '加载个人使用趋势失败',
  );
}
