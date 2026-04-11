import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  MockApiError,
  buildAuthHeadersMock,
  cookieValues,
  cookiesMock,
  fetchPublicWorkflowMock,
  fetchWorkflowContentMock,
  fetchWorkflowListMock,
} = vi.hoisted(() => {
  class MockApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  }

  const cookieValues = new Map<string, string>();
  const cookiesMock = vi.fn(async () => ({
    get: (name: string) => {
      const value = cookieValues.get(name);
      return value ? { value } : undefined;
    },
  }));

  return {
    MockApiError,
    buildAuthHeadersMock: vi.fn(),
    cookieValues,
    cookiesMock,
    fetchPublicWorkflowMock: vi.fn(),
    fetchWorkflowContentMock: vi.fn(),
    fetchWorkflowListMock: vi.fn(),
  };
});

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
}));

vi.mock('@/services/workflow.service', () => ({
  ApiError: MockApiError,
  fetchPublicWorkflow: fetchPublicWorkflowMock,
  fetchWorkflowContent: fetchWorkflowContentMock,
  fetchWorkflowList: fetchWorkflowListMock,
}));

vi.mock('@/services/api-client', () => ({
  buildApiUrl: (path: string) => path,
  buildAuthHeaders: buildAuthHeadersMock,
}));

import {
  fetchPublicWorkflowForServer,
  fetchUserQuotaForServer,
  fetchWorkflowContentForServer,
  fetchWorkflowListForServer,
} from '@/services/workflow.server.service';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('workflow server service wrappers', () => {
  beforeEach(() => {
    cookieValues.clear();
    cookiesMock.mockClear();
    fetchWorkflowListMock.mockReset();
    fetchWorkflowContentMock.mockReset();
    fetchPublicWorkflowMock.mockReset();
    buildAuthHeadersMock.mockReset();
    buildAuthHeadersMock.mockImplementation((token?: string) =>
      token ? { Authorization: `Bearer ${token}` } : {},
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('forwards the access token to fetchWorkflowListForServer', async () => {
    cookieValues.set('access_token', 'server-token');
    fetchWorkflowListMock.mockResolvedValueOnce([{ id: 'wf-1' }]);

    const workflows = await fetchWorkflowListForServer();

    expect(workflows).toEqual([{ id: 'wf-1' }]);
    expect(fetchWorkflowListMock).toHaveBeenCalledWith('server-token', 30);
  });

  it('retries fetchWorkflowContentForServer once after a successful server-side token refresh', async () => {
    cookieValues.set('access_token', 'stale-token');
    cookieValues.set('refresh_token', 'refresh-token');
    cookieValues.set('remember_me', 'true');
    fetchWorkflowContentMock
      .mockRejectedValueOnce(new MockApiError('Unauthorized', 401))
      .mockResolvedValueOnce({ id: 'wf-1', name: '工作流' });
    const fetchMock = vi.fn(async () => jsonResponse({ access_token: 'fresh-token' }));
    vi.stubGlobal('fetch', fetchMock);

    const workflow = await fetchWorkflowContentForServer('wf-1');

    expect(workflow).toEqual({ id: 'wf-1', name: '工作流' });
    expect(fetchWorkflowContentMock).toHaveBeenNthCalledWith(1, 'wf-1', 'stale-token');
    expect(fetchWorkflowContentMock).toHaveBeenNthCalledWith(2, 'wf-1', 'fresh-token');
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'refresh_token=refresh-token; remember_me=true',
      },
      cache: 'no-store',
    });
  });

  it('forwards the access token to fetchPublicWorkflowForServer', async () => {
    cookieValues.set('access_token', 'server-token');
    fetchPublicWorkflowMock.mockResolvedValueOnce({ id: 'wf-public' });

    const workflow = await fetchPublicWorkflowForServer('wf-public');

    expect(workflow).toEqual({ id: 'wf-public' });
    expect(fetchPublicWorkflowMock).toHaveBeenCalledWith('wf-public', 'server-token');
  });

  it('fetches quota with server auth headers and no-store semantics', async () => {
    cookieValues.set('access_token', 'server-token');
    const fetchMock = vi.fn(async () => jsonResponse({
      tier: 'free',
      workflows_used: 1,
      workflows_base_limit: 3,
      workflows_addon_qty: 0,
      workflows_total: 3,
      workflows_remaining: 2,
      daily_chat_used: 0,
      daily_chat_limit: 10,
      daily_execution_used: 0,
      daily_execution_limit: 5,
    }));
    vi.stubGlobal('fetch', fetchMock);

    const quota = await fetchUserQuotaForServer();

    expect(quota).toMatchObject({
      tier: 'free',
      workflows_total: 3,
      workflows_remaining: 2,
    });
    expect(buildAuthHeadersMock).toHaveBeenCalledWith('server-token');
    expect(fetchMock).toHaveBeenCalledWith('/api/usage/quota', {
      headers: { Authorization: 'Bearer server-token' },
      credentials: 'include',
      cache: 'no-store',
    });
  });
});
