import { describe, expect, it } from 'vitest';

import {
  getRenderer,
  getRendererByName,
  resolveRenderer,
} from '@/features/workflow/components/nodes';
import { MarkdownRenderer } from '@/features/workflow/components/nodes/renderers/MarkdownRenderer';
import { FlashcardRenderer } from '@/features/workflow/components/nodes/renderers/FlashcardRenderer';
import { QuizRenderer } from '@/features/workflow/components/nodes/renderers/QuizRenderer';

describe('node renderer registry', () => {
  it('keeps the existing node-type fallback behavior intact', () => {
    expect(getRenderer('flashcard')).toBe(FlashcardRenderer);
    expect(getRenderer('summary')).toBe(MarkdownRenderer);
    expect(getRenderer('missing-node-type')).toBe(MarkdownRenderer);
  });

  it('resolves known renderer names directly for future manifest-first wiring', () => {
    expect(getRendererByName('QuizRenderer')).toBe(QuizRenderer);
    expect(getRendererByName('MissingRenderer')).toBeNull();
  });

  it('prefers a known renderer name before falling back to the node-type registry', () => {
    expect(resolveRenderer({ nodeType: 'summary', rendererName: 'QuizRenderer' })).toBe(QuizRenderer);
    expect(resolveRenderer({ nodeType: 'summary', rendererName: 'MissingRenderer' })).toBe(MarkdownRenderer);
  });
});
