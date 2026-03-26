/**
 * 1037Solo 共享数据库类型定义
 *
 * 本文件定义了 Platform 和 StudySolo 共享 Supabase 数据库中的表结构。
 * 任何 AI 在生成数据库查询时，必须参考此文件中的类型。
 *
 * Supabase Project ID: hofcaclztjazoytmckup
 * Supabase URL: https://hofcaclztjazoytmckup.supabase.co
 *
 * --- 表名前缀规则 ---
 * 无前缀 → 共享表 (如 user_profiles, subscriptions)
 * ss_    → StudySolo 专属表
 * pt_    → Platform 专属表 (待迁移，当前仍用旧名)
 */

// ============================================
// 共享表 (无前缀) — 两个项目都会使用
// ============================================

/**
 * user_profiles — 用户业务信息表（共享）
 *
 * ⚠️ 这是 StudySolo 的用户表！不是 `users`！
 * ⚠️ Platform 目前使用旧的 `users` 表（TEXT id），结构完全不同。
 *
 * id 外键关联 auth.users(id)，由 handle_new_user 触发器自动创建。
 */
export interface UserProfile {
    /** UUID, 外键→auth.users(id) */
    id: string;
    /** 用户邮箱 */
    email: string;
    /** 昵称，可选 */
    nickname: string | null;
    /** 头像 URL */
    avatar_url: string | null;
    /** 会员等级: free | pro | pro_plus | ultra */
    tier: 'free' | 'pro' | 'pro_plus' | 'ultra';
    /** 学生认证标记 */
    is_student_verified: boolean;
    /** 创建时间 */
    created_at: string;
    /** 更新时间 */
    updated_at: string;
}

/**
 * subscriptions — 订阅信息表（共享）
 */
export interface Subscription {
    id: string;
    /** 外键→user_profiles(id) */
    user_id: string;
    /** 套餐等级 */
    tier: 'free' | 'pro' | 'pro_plus' | 'ultra';
    /** 订阅状态 */
    status: 'active' | 'canceled' | 'expired' | 'past_due';
    /** 当前周期开始时间 */
    current_period_start: string;
    /** 当前周期结束时间 */
    current_period_end: string;
    /** 支付渠道 */
    payment_channel: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * addon_purchases — 加油包购买记录（共享）
 */
export interface AddonPurchase {
    id: string;
    user_id: string;
    /** 加油包类型: tokens | storage | api_calls */
    addon_type: string;
    amount: number;
    unit: string;
    price_cents: number;
    /** 过期时间，null 表示永不过期 */
    expires_at: string | null;
    created_at: string;
}

/**
 * payment_records — 支付记录（共享）
 */
export interface PaymentRecord {
    id: string;
    user_id: string;
    amount_cents: number;
    currency: string;
    payment_channel: string;
    /** 外部支付平台的订单号 */
    external_order_id: string | null;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    /** 关联的订阅 ID */
    subscription_id: string | null;
    /** 关联的加油包 ID */
    addon_purchase_id: string | null;
    created_at: string;
}

/**
 * verification_codes_v2 — 验证码表（共享）
 *
 * ⚠️ Platform 使用旧的 `verification_codes` 表，字段不同。
 */
export interface VerificationCodeV2 {
    id: string;
    email: string;
    code: string;
    /** register | reset | login */
    type: string;
    expires_at: string;
    is_used: boolean;
    created_at: string;
}

// ============================================
// StudySolo 专属表 (ss_ 前缀)
// ============================================

/**
 * ss_workflows — 工作流（StudySolo 专属）
 *
 * ⚠️ 表名是 ss_workflows，不是 workflows！
 */
export interface SsWorkflow {
    id: string;
    /** 外键→user_profiles(id)，UUID */
    user_id: string;
    name: string;
    description: string | null;
    /** 工作流节点 JSON */
    nodes_json: Record<string, unknown>[];
    /** 工作流边 JSON */
    edges_json: Record<string, unknown>[];
    /** draft | published | archived */
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
}

/**
 * ss_workflow_runs — 工作流运行记录（StudySolo 专属）
 */
export interface SsWorkflowRun {
    id: string;
    /** 外键→ss_workflows(id) */
    workflow_id: string;
    user_id: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    /** 运行结果 JSON */
    result_json: Record<string, unknown> | null;
    /** 运行耗时(ms) */
    duration_ms: number | null;
    /** 消耗的 token 数 */
    tokens_used: number;
    started_at: string;
    completed_at: string | null;
}

/**
 * ss_usage_daily — 每日用量统计（StudySolo 专属）
 */
export interface SsUsageDaily {
    id: string;
    user_id: string;
    /** 日期 YYYY-MM-DD */
    usage_date: string;
    /** API 调用次数 */
    api_calls: number;
    /** 消耗 token 数 */
    tokens_used: number;
    /** 运行工作流次数 */
    workflow_runs: number;
    created_at: string;
    updated_at: string;
}

// ============================================
// Platform 旧表 (当前无前缀，待迁移为 pt_)
// ============================================

/**
 * users — Platform 旧用户表
 *
 * ⚠️ 这是 Platform 的旧表！StudySolo 绝对不能引用！
 * ⚠️ id 是 TEXT 类型（不是 UUID），有 password_hash 字段。
 * ⚠️ 待迁移为 pt_users。
 */
export interface PlatformLegacyUser {
    /** TEXT 类型 (非 UUID!) */
    id: string;
    email: string;
    /** bcrypt hash */
    password_hash: string;
    role: 'student' | 'admin';
    nickname: string | null;
    fingerprint: string | null;
    login_count: number;
    total_tokens_used: number;
    last_login_at: string | null;
    last_login_ip: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

// ============================================
// 类型导出汇总
// ============================================

/** 共享表名常量 — 所有数据库查询应使用这些常量 */
export const TABLE_NAMES = {
    // 共享 (无前缀)
    USER_PROFILES: 'user_profiles',
    SUBSCRIPTIONS: 'subscriptions',
    ADDON_PURCHASES: 'addon_purchases',
    PAYMENT_RECORDS: 'payment_records',
    VERIFICATION_CODES_V2: 'verification_codes_v2',

    // StudySolo (ss_ 前缀)
    SS_WORKFLOWS: 'ss_workflows',
    SS_WORKFLOW_RUNS: 'ss_workflow_runs',
    SS_USAGE_DAILY: 'ss_usage_daily',

    // Platform 旧表 (待迁移)
    PT_LEGACY_USERS: 'users',
    PT_LEGACY_SESSIONS: 'sessions',
    PT_LEGACY_CONVERSATIONS: 'conversations',
    PT_LEGACY_MESSAGES: 'messages',
} as const;
