export interface SponsorshipPlan {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  price: number;
}

export interface SponsorshipStats {
  totalSponsored: number;
  totalRevenue: number;
}