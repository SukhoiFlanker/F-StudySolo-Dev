/**
 * parse-thinking — Extract `<think>` blocks from DeepSeek R1 responses.
 *
 * The backend wraps reasoning_content in `<think>...</think>` tags.
 * This utility separates thinking and answer content for independent rendering.
 *
 * Stream-safe: handles unclosed `<think>` tags during streaming.
 */

export interface ParsedThinking {
  /** Model's chain-of-thought reasoning (inside <think> tags) */
  thinking: string;
  /** Final answer (outside <think> tags) */
  answer: string;
  /** Whether any thinking content exists */
  hasThinking: boolean;
}

export function parseThinking(content: string): ParsedThinking {
  let thinking = '';
  let answer = content;

  // Extract all closed <think>...</think> blocks
  const closedRegex = /<think>([\s\S]*?)<\/think>/g;
  let match: RegExpExecArray | null;
  while ((match = closedRegex.exec(content)) !== null) {
    thinking += match[1];
  }
  answer = content.replace(/<think>[\s\S]*?<\/think>/g, '');

  // Handle unclosed <think> tag (streaming mid-reasoning)
  const unclosedMatch = answer.match(/<think>([\s\S]*)$/);
  if (unclosedMatch) {
    thinking += unclosedMatch[1];
    answer = answer.replace(/<think>[\s\S]*$/, '');
  }

  return {
    thinking: thinking.trim(),
    answer: answer.trim(),
    hasThinking: thinking.trim().length > 0,
  };
}
