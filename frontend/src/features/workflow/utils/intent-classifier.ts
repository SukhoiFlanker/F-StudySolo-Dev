/**
 * 前端意图预分类器 — 零 API 调用, 纯规则引擎.
 *
 * 根据用户输入 + 画布状态快速判断意图,
 * 高置信度时直接执行, 低置信度时交由后端 AI 确认。
 */

import type { CanvasContext } from '../hooks/use-canvas-context';

export type IntentType = 'BUILD' | 'MODIFY' | 'CHAT' | 'ACTION';

export interface ClassificationResult {
  intent: IntentType;
  confidence: number;
  signals: string[];
}

// ── 信号正则 ─────────────────────────────────────────────────────

const BUILD_SIGNALS: RegExp[] = [
  /创建|搭建|设计|做一个|构建|生成.*工作流/,
  /帮我.*学|我想学|我要学|学习.*计划/,
  /从头|从零|重新做/,
];

const MODIFY_SIGNALS: RegExp[] = [
  /加一个|添加|新增|插入/,
  /删掉|删除|去掉|移除/,
  /修改|改一下|调整|替换|换成/,
  /移动|移到|放到|挪/,
  /连接|断开|连线|取消连接/,
  /节点.*后面|前面.*节点/,
  /第[一二三四五六七八九十\d]+个/,
];

const ACTION_SIGNALS: RegExp[] = [
  /^(运行|执行|开始|停止|暂停|保存|导出|撤销|重做)/,
  /运行一下|跑一下|执行一下|保存一下/,
];

const CHAT_SIGNALS: RegExp[] = [
  /怎么样|怎样|如何|为什么|什么是|解释|说明/,
  /建议|你觉得|你认为|帮我看看|分析一下/,
  /[?？]$/,
];

// ── 分类函数 ─────────────────────────────────────────────────────

function matchSignals(input: string, patterns: RegExp[]): string[] {
  return patterns.filter((p) => p.test(input)).map((p) => p.source);
}

export function classifyIntent(
  input: string,
  canvasContext: CanvasContext,
): ClassificationResult {
  const scores: Record<IntentType, { score: number; signals: string[] }> = {
    BUILD: { score: 0, signals: [] },
    MODIFY: { score: 0, signals: [] },
    CHAT: { score: 0, signals: [] },
    ACTION: { score: 0, signals: [] },
  };

  // 1. 关键词匹配
  scores.BUILD.signals = matchSignals(input, BUILD_SIGNALS);
  scores.BUILD.score = scores.BUILD.signals.length * 30;

  scores.MODIFY.signals = matchSignals(input, MODIFY_SIGNALS);
  scores.MODIFY.score = scores.MODIFY.signals.length * 35;

  scores.ACTION.signals = matchSignals(input, ACTION_SIGNALS);
  scores.ACTION.score = scores.ACTION.signals.length * 50;

  scores.CHAT.signals = matchSignals(input, CHAT_SIGNALS);
  scores.CHAT.score = scores.CHAT.signals.length * 25;

  // 2. 画布状态加权
  const hasCanvas = canvasContext.nodesSummary.length > 0;

  if (!hasCanvas) {
    scores.BUILD.score += 40;
    scores.MODIFY.score = 0;
  } else if (scores.BUILD.score === 0 && scores.MODIFY.score > 0) {
    scores.MODIFY.score += 20;
  }

  // 3. Fallback
  const allZero = Object.values(scores).every((s) => s.score === 0);
  if (allZero) {
    if (hasCanvas) {
      scores.CHAT.score = 50;
    } else {
      scores.BUILD.score = 50;
    }
  }

  // 4. 选最高分
  const sorted = Object.entries(scores).sort(
    ([, a], [, b]) => b.score - a.score,
  ) as [IntentType, { score: number; signals: string[] }][];

  const [topIntent, topData] = sorted[0];
  const totalScore = sorted.reduce((sum, [, s]) => sum + s.score, 0);
  const confidence = totalScore > 0
    ? Math.min(topData.score / totalScore, 1)
    : 0.5;

  return {
    intent: topIntent,
    confidence: Math.round(confidence * 100) / 100,
    signals: topData.signals,
  };
}
