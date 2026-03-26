import { describe, expect, it } from 'vitest';
import { buildEdgeDisplayState } from '@/features/workflow/utils/edge-display';

describe('edge display state', () => {
  it('prefers branch labels for logic_switch edges and keeps wait badge', () => {
    const display = buildEdgeDisplayState(
      { branch: 'A', note: 'ignored', waitSeconds: 2 },
      true,
    );

    expect(display.primaryLabel).toBe('A');
    expect(display.waitLabel).toBe('⏱ 2s');
  });

  it('shows note for sequential edges and hides zero wait badges', () => {
    const display = buildEdgeDisplayState(
      { note: '先执行摘要', waitSeconds: 0 },
      false,
    );

    expect(display.primaryLabel).toBe('先执行摘要');
    expect(display.waitLabel).toBeNull();
  });
});
