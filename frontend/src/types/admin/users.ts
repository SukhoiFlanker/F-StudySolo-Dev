export interface UserListItem {
  id: string;
  email: string;
  tier: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface PaginatedUserList {
  users: UserListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type TierFilter = 'all' | 'free' | 'pro' | 'pro_plus' | 'ultra';
export type StatusFilter = 'all' | 'active' | 'inactive';

export interface UserDetail {
  id: string;
  email: string;
  tier: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface Subscription {
  id: string;
  tier: string;
  plan_type: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
}

export interface UsageStats {
  total_runs: number;
  total_tokens: number;
  last_30_days_runs: number;
}

export interface UserDetailResponse {
  user: UserDetail;
  subscription: Subscription | null;
  usage_stats: UsageStats;
}

export type TierValue = 'free' | 'pro' | 'pro_plus' | 'ultra';
