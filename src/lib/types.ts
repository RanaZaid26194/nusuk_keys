export interface ChallengeKey {
  id: string;
  code: string;
  upvotes: number;
  downvotes: number;
  copies_count: number;
  is_active: boolean;
  created_at: string;
  last_verified_at: string;
  userVoted?: 'UP' | 'DOWN' | null;
}

export type FilterTab = 'all' | 'verified' | 'popular' | 'latest' | 'used';

export type Language = 'en' | 'ar';

export interface SubmitKeyInput {
  code: string;
}

export interface Stats {
  totalKeys: number;
  activeKeys: number;
  totalCopies: number;
  successRate: number;
}
