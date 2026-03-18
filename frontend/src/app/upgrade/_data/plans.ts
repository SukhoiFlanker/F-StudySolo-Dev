/** Tier plan definitions — single source of truth for the upgrade page. */

export type TierId = 'free' | 'pro' | 'pro_plus' | 'ultra';
export type PaymentRegion = 'domestic' | 'overseas';
export type BillingCycle = 'monthly' | 'yearly';

/* ── Price helpers ── */
export interface PriceSet {
  cny: { monthly: number; yearly: number };
  usd: { monthly: number; yearly: number };
}

export function getPrice(ps: PriceSet, region: PaymentRegion, cycle: BillingCycle) {
  const cur = region === 'domestic' ? ps.cny : ps.usd;
  return cycle === 'yearly' ? cur.yearly : cur.monthly;
}

export function getCurrencySymbol(region: PaymentRegion) {
  return region === 'domestic' ? '¥' : '$';
}

/* ── Plan Features ── */
export interface PlanFeature {
  text: string;
  icon: 'slash' | 'check-square' | 'check-circle' | 'bolt';
  bold?: boolean;
  highlight?: boolean;
}

/* ── Tier Plan ── */
export interface TierPlan {
  id: TierId;
  slug: string;
  name: string;
  prices: PriceSet;
  tagline: string;
  badge?: { text: string; variant: 'red' | 'blue' };
  cta: { text: string; variant: 'default' | 'outline-blue' | 'filled-blue' | 'outline-emerald' };
  features: PlanFeature[];
  highlighted?: boolean;
  accentColor: 'blue' | 'emerald';
  rotation: string;
}

export const TIER_PLANS: TierPlan[] = [
  {
    id: 'free',
    slug: '# Free_Tier',
    name: '免费版',
    prices: { cny: { monthly: 0, yearly: 0 }, usd: { monthly: 0, yearly: 0 } },
    tagline: '基础功能体验，开启 AI 之旅。',
    cta: { text: '当前计划', variant: 'default' },
    accentColor: 'blue',
    rotation: '-rotate-[0.5deg]',
    features: [
      { text: '1GB 云端存储', icon: 'slash' },
      { text: '10 个工作流', icon: 'slash' },
      { text: '每日执行上限 20 次', icon: 'slash' },
      { text: '2 并发执行', icon: 'slash' },
    ],
  },
  {
    id: 'pro',
    slug: '# Pro_Tier',
    name: 'Pro 版',
    prices: { cny: { monthly: 25, yearly: 199 }, usd: { monthly: 3.99, yearly: 29.99 } },
    tagline: '高性价比，适合个人深度使用。',
    badge: { text: '新人专享: ¥3 首月', variant: 'red' },
    cta: { text: '立即订阅', variant: 'outline-blue' },
    accentColor: 'blue',
    rotation: 'rotate-[0.5deg]',
    features: [
      { text: '3GB 云端存储', icon: 'check-square' },
      { text: '50 个工作流', icon: 'check-square' },
      { text: '每日 50 次执行', icon: 'check-square' },
      { text: '5 并发执行 / 满血模型', icon: 'check-square' },
    ],
  },
  {
    id: 'pro_plus',
    slug: '# Pro_Plus_Tier',
    name: 'Pro+ 版',
    prices: { cny: { monthly: 79, yearly: 599 }, usd: { monthly: 11.99, yearly: 89.99 } },
    tagline: '专业生产力工具，解锁极致效率。',
    badge: { text: '最受欢迎', variant: 'blue' },
    highlighted: true,
    cta: { text: '立即订阅', variant: 'filled-blue' },
    accentColor: 'blue',
    rotation: '',
    features: [
      { text: '10GB 云端存储', icon: 'check-circle', bold: true },
      { text: '200 个工作流', icon: 'check-circle', bold: true },
      { text: '每日 150 次执行', icon: 'check-circle', bold: true },
      { text: '10 并发 / 优先执行权', icon: 'bolt', highlight: true },
    ],
  },
  {
    id: 'ultra',
    slug: '# Ultra_Tier',
    name: 'Ultra 版',
    prices: { cny: { monthly: 1299, yearly: 9999 }, usd: { monthly: 189.99, yearly: 1499.99 } },
    tagline: '旗舰级性能，全方位专属服务。',
    cta: { text: '联系销售团队', variant: 'outline-emerald' },
    accentColor: 'emerald',
    rotation: '-rotate-[0.3deg]',
    features: [
      { text: '100GB 云端存储', icon: 'slash' },
      { text: '无限工作流', icon: 'slash' },
      { text: '每日 500 次执行', icon: 'slash' },
      { text: '全旗舰模型支持', icon: 'slash' },
    ],
  },
];

/* ── Add-on definitions (multi-tier) ── */
export interface AddonTier {
  label: string;
  priceCny: number;
  priceUsd: number;
  selected?: boolean;
}

export interface AddonCategory {
  slug: string;
  title: string;
  tiers: AddonTier[];
}

export const ADDON_CATEGORIES: AddonCategory[] = [
  {
    slug: '# 存储空间',
    title: '存储空间',
    tiers: [
      { label: '10GB', priceCny: 5, priceUsd: 0.99 },
      { label: '50GB', priceCny: 20, priceUsd: 2.99 },
      { label: '100GB', priceCny: 35, priceUsd: 4.99, selected: true },
    ],
  },
  {
    slug: '# 工作流数量',
    title: '工作流数量',
    tiers: [
      { label: '50 个', priceCny: 15, priceUsd: 1.99 },
      { label: '200 个', priceCny: 45, priceUsd: 6.99 },
      { label: '500 个', priceCny: 99, priceUsd: 14.99 },
    ],
  },
  {
    slug: '# 并发数',
    title: '并发数',
    tiers: [
      { label: '2 并发', priceCny: 30, priceUsd: 4.99 },
      { label: '5 并发', priceCny: 65, priceUsd: 9.99 },
      { label: '10 并发', priceCny: 110, priceUsd: 15.99 },
    ],
  },
];

/* ── Comparison table rows ── */
export interface ComparisonRow {
  label: string;
  free: string;
  pro: string;
  proPlus: string;
  ultra: string;
  isHeader?: boolean;
  headerLabel?: string;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  { label: '', free: '', pro: '', proPlus: '', ultra: '', isHeader: true, headerLabel: '资源配额 / INFRASTRUCTURE' },
  { label: '云存储配额', free: '1 GB', pro: '3 GB', proPlus: '10 GB', ultra: '100 GB' },
  { label: '工作流数量上限', free: '10 个', pro: '50 个', proPlus: '200 个', ultra: '无限制' },
  { label: '', free: '', pro: '', proPlus: '', ultra: '', isHeader: true, headerLabel: '执行效能 / PERFORMANCE' },
  { label: '每日执行上限', free: '20 次', pro: '50 次', proPlus: '150 次', ultra: '500 次' },
  { label: '单次循环上限', free: '5 步', pro: '20 步', proPlus: '100 步', ultra: '无限制' },
  { label: '并发数', free: '2', pro: '5', proPlus: '10', ultra: '100' },
  { label: '', free: '', pro: '', proPlus: '', ultra: '', isHeader: true, headerLabel: 'AI 模型架构 / MODEL CAPABILITIES' },
  { label: '模型能力支持', free: '基础模型', pro: '满血模型', proPlus: '满血模型 + 优先通道', ultra: '全旗舰模型' },
  { label: '', free: '', pro: '', proPlus: '', ultra: '', isHeader: true, headerLabel: '其它服务 / EXTRA SERVICES' },
  { label: '客户支持', free: '社区', pro: '邮件', proPlus: '12H 优先响应', ultra: '1v1 专属管家' },
];
