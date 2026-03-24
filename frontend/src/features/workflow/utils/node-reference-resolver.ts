'use client';

/**
 * NodeReferenceResolver — 自然语言节点引用 → node ID.
 *
 * 用户在对话中用自然语言指代节点, 本模块将其映射到真实 ID。
 * 纯前端零成本解析, 作为 AI 的辅助补充。
 *
 * 支持的引用模式:
 *   序号:    "第1个" "第三个" "第一个节点"
 *   标签:    "总结节点" "大纲那个" "闪卡"
 *   位置:    "最后一个" "第一个" "倒数第二个"
 *   类型:    "测验节点" "思维导图"
 *   关系:    "大纲后面的" "总结前面的"
 */

import type { NodeSummary } from '@/features/workflow/hooks/use-canvas-context';

// ── 中文数字映射 ────────────────────────────────────────────────

const CN_NUM: Record<string, number> = {
  一: 1, 二: 2, 三: 3, 四: 4, 五: 5,
  六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
  两: 2,
};

function parseCnNumber(s: string): number | null {
  const arabic = parseInt(s, 10);
  if (!isNaN(arabic)) return arabic;
  return CN_NUM[s] ?? null;
}

// ── 节点类型别名 (用户可能说的名称 → 实际 type) ────────────────

const TYPE_ALIASES: Record<string, string[]> = {
  outline_gen: ['大纲', '目录', '纲要', '提纲'],
  content_extract: ['内容提炼', '提炼', '知识点', '提取'],
  summary: ['总结', '归纳', '小结', '概要'],
  flashcard: ['闪卡', '卡片', '记忆卡', '问答卡'],
  quiz_gen: ['测验', '测试', '考试', '题目', '习题'],
  mind_map: ['思维导图', '脑图', '导图'],
  chat_response: ['聊天', '回复', '对话', '交互'],
  compare: ['对比', '比较', '对照'],
  merge_polish: ['合并', '润色', '整合'],
  knowledge_base: ['知识库', '检索', '搜索知识'],
  web_search: ['搜索', '网络搜索', '联网'],
  export_file: ['导出', '输出', '下载'],
  write_db: ['写入', '保存', '数据库'],
  logic_switch: ['分支', '条件', '判断', '路由'],
  loop_map: ['循环', '映射', '遍历'],
};

// ── 解析结果 ────────────────────────────────────────────────────

export interface ResolveResult {
  nodeId: string | null;
  label: string | null;
  confidence: number;
  method: 'index' | 'label' | 'position' | 'type' | 'relation' | 'none';
}

// ── 主解析函数 ──────────────────────────────────────────────────

export function resolveNodeReference(
  input: string,
  nodes: NodeSummary[],
): ResolveResult {
  if (!nodes.length) return { nodeId: null, label: null, confidence: 0, method: 'none' };

  // 1. 序号引用 — "第N个节点"
  const indexMatch = input.match(/第([一二三四五六七八九十\d]+)个/);
  if (indexMatch) {
    const idx = parseCnNumber(indexMatch[1]);
    if (idx !== null && idx >= 1 && idx <= nodes.length) {
      const node = nodes[idx - 1];
      return { nodeId: node.id, label: node.label, confidence: 0.95, method: 'index' };
    }
  }

  // 2. 位置引用 — "最后一个" "第一个" "倒数第二个"
  if (/最后|末尾|最末/.test(input)) {
    const node = nodes[nodes.length - 1];
    return { nodeId: node.id, label: node.label, confidence: 0.9, method: 'position' };
  }
  if (/第一个|开头|最前/.test(input)) {
    const node = nodes[0];
    return { nodeId: node.id, label: node.label, confidence: 0.9, method: 'position' };
  }
  const reverseMatch = input.match(/倒数第([一二三四五六七八九十\d]+)个/);
  if (reverseMatch) {
    const idx = parseCnNumber(reverseMatch[1]);
    if (idx !== null && idx >= 1 && idx <= nodes.length) {
      const node = nodes[nodes.length - idx];
      return { nodeId: node.id, label: node.label, confidence: 0.85, method: 'position' };
    }
  }

  // 3. 标签模糊匹配 — "总结节点" "大纲那个"
  const cleanInput = input.replace(/节点|那个|这个|的/g, '');
  for (const node of nodes) {
    if (cleanInput.includes(node.label) || node.label.includes(cleanInput.slice(0, 6))) {
      return { nodeId: node.id, label: node.label, confidence: 0.85, method: 'label' };
    }
  }

  // 4. 类型别名匹配 — "闪卡" "测验" "思维导图"
  for (const [nodeType, aliases] of Object.entries(TYPE_ALIASES)) {
    for (const alias of aliases) {
      if (input.includes(alias)) {
        const node = nodes.find((n) => n.type === nodeType);
        if (node) {
          return { nodeId: node.id, label: node.label, confidence: 0.8, method: 'type' };
        }
      }
    }
  }

  // 5. 关系引用 — "大纲后面的" "总结前面的"
  const afterMatch = input.match(/(.{1,6})(后面的?|之后的?|下游的?)/);
  if (afterMatch) {
    const anchorName = afterMatch[1].replace(/在|把|将/g, '');
    const anchor = nodes.find((n) => n.label.includes(anchorName));
    if (anchor && anchor.downstreamLabels.length > 0) {
      const downstream = nodes.find((n) =>
        anchor.downstreamLabels.includes(n.label),
      );
      if (downstream) {
        return { nodeId: downstream.id, label: downstream.label, confidence: 0.75, method: 'relation' };
      }
    }
  }

  const beforeMatch = input.match(/(.{1,6})(前面的?|之前的?|上游的?)/);
  if (beforeMatch) {
    const anchorName = beforeMatch[1].replace(/在|把|将/g, '');
    const anchor = nodes.find((n) => n.label.includes(anchorName));
    if (anchor && anchor.upstreamLabels.length > 0) {
      const upstream = nodes.find((n) =>
        anchor.upstreamLabels.includes(n.label),
      );
      if (upstream) {
        return { nodeId: upstream.id, label: upstream.label, confidence: 0.75, method: 'relation' };
      }
    }
  }

  return { nodeId: null, label: null, confidence: 0, method: 'none' };
}

/**
 * 批量解析输入中所有可能的节点引用.
 * 返回所有置信度 > threshold 的匹配项.
 */
export function resolveAllReferences(
  input: string,
  nodes: NodeSummary[],
  threshold = 0.6,
): ResolveResult[] {
  const results: ResolveResult[] = [];
  const primary = resolveNodeReference(input, nodes);
  if (primary.confidence >= threshold) results.push(primary);
  return results;
}
