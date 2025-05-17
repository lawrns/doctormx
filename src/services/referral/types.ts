export interface Referral {
  id: string;
  code: string;
  name: string | null;
  createdAt: string;
  usageCount: number;
  lastUsedAt: string | null;
  referrerId: string;
}

export interface ReferralStats {
  totalGenerated: number;
  totalUsed: number;
}