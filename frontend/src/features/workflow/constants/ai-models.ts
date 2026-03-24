/**
 * AI 对话可选模型定义.
 *
 * 每个供应商提供:
 * - 1 个中等免费模型 (所有用户可用)
 * - 1 个旗舰会员模型 (需要订阅)
 */

export interface AIModelOption {
  /** 供应商 ID (对应 config.yaml platforms key) */
  platform: string;
  /** 模型 ID (发送给后端) */
  model: string;
  /** 用户可见的模型名称 */
  displayName: string;
  /** 供应商名称 */
  providerName: string;
  /** 供应商品牌色 (用于 UI 标识) */
  brandColor: string;
  /** 是否需要会员 */
  isPremium: boolean;
  /** 模型简介 */
  description: string;
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  // ── DeepSeek ──────────────────────────────────────
  {
    platform: 'deepseek',
    model: 'deepseek-chat',
    displayName: 'DeepSeek V3',
    providerName: 'DeepSeek',
    brandColor: '#4D6BFE',
    isPremium: false,
    description: '均衡推理, 适合日常对话',
  },
  {
    platform: 'deepseek',
    model: 'deepseek-reasoner',
    displayName: 'DeepSeek R1',
    providerName: 'DeepSeek',
    brandColor: '#4D6BFE',
    isPremium: true,
    description: '顶级深度推理模型',
  },
  // ── 火山引擎 (豆包) ──────────────────────────────
  {
    platform: 'volcengine',
    model: 'doubao-pro-32k',
    displayName: '豆包 Pro',
    providerName: '豆包',
    brandColor: '#3370FF',
    isPremium: false,
    description: '长文本理解, 适合分析',
  },
  {
    platform: 'volcengine',
    model: 'doubao-pro-256k',
    displayName: '豆包 Pro 256K',
    providerName: '豆包',
    brandColor: '#3370FF',
    isPremium: true,
    description: '超长上下文旗舰',
  },
  // ── 阿里云百炼 (通义千问) ────────────────────────
  {
    platform: 'dashscope',
    model: 'qwen-turbo',
    displayName: '通义千问 Turbo',
    providerName: '通义千问',
    brandColor: '#6B5CE7',
    isPremium: false,
    description: '快速响应, 适合轻量任务',
  },
  {
    platform: 'dashscope',
    model: 'qwen-max',
    displayName: '通义千问 Max',
    providerName: '通义千问',
    brandColor: '#6B5CE7',
    isPremium: true,
    description: '最强通义旗舰模型',
  },
  // ── 智谱 AI ──────────────────────────────────────
  {
    platform: 'zhipu',
    model: 'glm-4-flash',
    displayName: 'GLM-4 Flash',
    providerName: '智谱',
    brandColor: '#2563EB',
    isPremium: false,
    description: '高效通用对话模型',
  },
  {
    platform: 'zhipu',
    model: 'glm-4',
    displayName: 'GLM-4',
    providerName: '智谱',
    brandColor: '#2563EB',
    isPremium: true,
    description: '智谱旗舰大模型',
  },
  // ── 月之暗面 (Kimi) ─────────────────────────────
  {
    platform: 'moonshot',
    model: 'moonshot-v1-8k',
    displayName: 'Kimi 8K',
    providerName: 'Kimi',
    brandColor: '#1E1E1E',
    isPremium: false,
    description: '中等上下文对话模型',
  },
  {
    platform: 'moonshot',
    model: 'moonshot-v1-128k',
    displayName: 'Kimi 128K',
    providerName: 'Kimi',
    brandColor: '#1E1E1E',
    isPremium: true,
    description: '超长上下文旗舰',
  },
];

/** 默认模型 (DeepSeek V3) */
export const DEFAULT_MODEL = AI_MODEL_OPTIONS[0];

/** 仅免费模型 */
export const FREE_MODELS = AI_MODEL_OPTIONS.filter((m) => !m.isPremium);

/** 按供应商分组 */
export function groupModelsByProvider() {
  const groups: Record<string, AIModelOption[]> = {};
  for (const model of AI_MODEL_OPTIONS) {
    if (!groups[model.providerName]) {
      groups[model.providerName] = [];
    }
    groups[model.providerName].push(model);
  }
  return groups;
}
