/**
 * Node renderer registry maps workflow node types to renderer components.
 *
 * The static node-type fallback remains the active behavior today. Renderer-name
 * resolution is exposed separately so manifest-first wiring can be enabled later
 * without reshaping the existing callers.
 */

import React from 'react';
import { MarkdownRenderer } from './renderers/MarkdownRenderer';
import { FlashcardRenderer } from './renderers/FlashcardRenderer';
import { OutlineRenderer } from './renderers/OutlineRenderer';
import { JsonRenderer } from './renderers/JsonRenderer';
import { PassthroughRenderer } from './renderers/PassthroughRenderer';
import { CompareRenderer } from './renderers/CompareRenderer';
import { MindMapRenderer } from './renderers/MindMapRenderer';
import { QuizRenderer } from './renderers/QuizRenderer';
import ExportRenderer from './renderers/ExportRenderer';

export interface NodeRendererProps {
  output: string;
  format: string;
  nodeType: string;
  isStreaming: boolean;
  compact?: boolean;
}

const CommunityNodeRenderer: React.FC<NodeRendererProps> = ({ format, ...props }) =>
  format === 'json'
    ? React.createElement(JsonRenderer, { ...props, format })
    : React.createElement(MarkdownRenderer, { ...props, format });

const RENDERER_COMPONENTS: Record<string, React.FC<NodeRendererProps>> = {
  MarkdownRenderer,
  FlashcardRenderer,
  OutlineRenderer,
  JsonRenderer,
  PassthroughRenderer,
  CompareRenderer,
  MindMapRenderer,
  QuizRenderer,
  ExportRenderer,
  CommunityNodeRenderer,
};

const NODE_TYPE_RENDERERS: Record<string, keyof typeof RENDERER_COMPONENTS> = {
  flashcard: 'FlashcardRenderer',
  outline_gen: 'OutlineRenderer',
  ai_analyzer: 'JsonRenderer',
  ai_planner: 'JsonRenderer',
  summary: 'MarkdownRenderer',
  content_extract: 'MarkdownRenderer',
  chat_response: 'MarkdownRenderer',
  trigger_input: 'PassthroughRenderer',
  write_db: 'JsonRenderer',
  compare: 'CompareRenderer',
  mind_map: 'MindMapRenderer',
  quiz_gen: 'QuizRenderer',
  merge_polish: 'MarkdownRenderer',
  knowledge_base: 'MarkdownRenderer',
  web_search: 'MarkdownRenderer',
  export_file: 'ExportRenderer',
  community_node: 'CommunityNodeRenderer',
  logic_switch: 'JsonRenderer',
  loop_map: 'JsonRenderer',
};

export function getRendererByName(
  rendererName: string | null | undefined,
): React.FC<NodeRendererProps> | null {
  if (!rendererName) {
    return null;
  }

  return RENDERER_COMPONENTS[rendererName] ?? null;
}

export function getRenderer(nodeType: string): React.FC<NodeRendererProps> {
  const rendererName = NODE_TYPE_RENDERERS[nodeType];
  return getRendererByName(rendererName) ?? MarkdownRenderer;
}

export function resolveRenderer({
  nodeType,
  rendererName,
}: {
  nodeType: string;
  rendererName?: string | null;
}): React.FC<NodeRendererProps> {
  return getRendererByName(rendererName) ?? getRenderer(nodeType);
}
