import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as fc from 'fast-check';

const { credentialsFetchMock } = vi.hoisted(() => ({
  credentialsFetchMock: vi.fn(),
}));

vi.mock('@/services/api-client', () => ({
  credentialsFetch: credentialsFetchMock,
}));

import {
  getAuditLogs,
  getUsers,
  updateUserStatus,
} from '@/services/admin.service';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('admin service helpers', () => {
  beforeEach(() => {
    credentialsFetchMock.mockReset();
    credentialsFetchMock.mockImplementation(() => Promise.resolve(jsonResponse({ ok: true })));
  });

  it('forwards user list query params without rewriting keys or values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.dictionary(
          fc.stringMatching(/^[a-z_]{1,12}$/),
          fc.stringMatching(/^[a-zA-Z0-9_.-]{0,16}$/),
          { maxKeys: 5 }
        ),
        async (entries) => {
          credentialsFetchMock.mockClear();
          const params = new URLSearchParams(entries);

          await getUsers(params);

          expect(credentialsFetchMock).toHaveBeenCalledTimes(1);
          expect(credentialsFetchMock.mock.calls[0]?.[0]).toBe(
            `/api/admin/users?${params.toString()}`
          );
        }
      ),
      { numRuns: 60 }
    );
  });

  it('forwards audit log query params without changing the serialized query', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.dictionary(
          fc.stringMatching(/^[a-z_]{1,16}$/),
          fc.stringMatching(/^[a-zA-Z0-9_.:-]{0,18}$/),
          { maxKeys: 5 }
        ),
        async (entries) => {
          credentialsFetchMock.mockClear();
          const params = new URLSearchParams(entries);

          await getAuditLogs(params);

          expect(credentialsFetchMock).toHaveBeenCalledTimes(1);
          expect(credentialsFetchMock.mock.calls[0]?.[0]).toBe(
            `/api/admin/audit-logs?${params.toString()}`
          );
        }
      ),
      { numRuns: 60 }
    );
  });

  it('sends the exact status toggle payload required by the backend contract', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), fc.boolean(), async (userId, isActive) => {
        credentialsFetchMock.mockClear();

        await updateUserStatus(userId, isActive);

        expect(credentialsFetchMock).toHaveBeenCalledTimes(1);
        expect(credentialsFetchMock.mock.calls[0]?.[0]).toBe(
          `/api/admin/users/${userId}/status`
        );
        expect(credentialsFetchMock.mock.calls[0]?.[1]).toMatchObject({
          method: 'PUT',
          body: JSON.stringify({ is_active: isActive }),
        });
      }),
      { numRuns: 40 }
    );
  });
});
