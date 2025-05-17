import React from 'react';
import type { SponsorshipPlan, SponsorshipStats } from '../../../services/sponsorship/types';

interface ProductRecommendationsProps {
  plans: SponsorshipPlan[];
  stats?: Record<string, SponsorshipStats>;
  onOptIn?: (planId: string) => void;
  loadingPlanId?: string | null;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ plans, stats, onOptIn, loadingPlanId }) => (
  <div className="product-recommendations grid gap-4">
    {plans.map(plan => (
      <div key={plan.id} className="plan-card p-4 bg-white shadow rounded">
        <h3 className="text-lg font-bold">{plan.name}</h3>
        <p className="text-sm">{plan.description}</p>
        <p className="mt-2 text-sm">Price: ${plan.price}</p>
        {stats && stats[plan.id] && (
          <div className="mt-2 text-sm text-gray-600">
            Patrocinadores: {stats[plan.id].totalSponsored}, Ingresos: ${stats[plan.id].totalRevenue}
          </div>
        )}
        {onOptIn && (
          <button
            onClick={() => onOptIn(plan.id)}
            disabled={loadingPlanId === plan.id}
            className="mt-4 w-full btn-primary"
          >
            {loadingPlanId === plan.id ? 'Procesando...' : 'Patrocinar'}
          </button>
        )}
      </div>
    ))}
  </div>
);

export default ProductRecommendations;