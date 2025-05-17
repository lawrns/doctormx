import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { SponsorshipService } from '../../../services/sponsorship';
import type { SponsorshipPlan, SponsorshipStats } from '../../../services/sponsorship/types';
import ProductRecommendations from '../components/ProductRecommendations';

const SponsorshipProgramPage: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SponsorshipPlan[]>([]);
  const [stats, setStats] = useState<Record<string, SponsorshipStats>>({});
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const fetched = await SponsorshipService.getPlans();
        setPlans(fetched);
        const entries = await Promise.all(
          fetched.map(async (plan) => {
            try {
              const s = await SponsorshipService.getStats(plan.id);
              return [plan.id, s] as [string, SponsorshipStats];
            } catch {
              return [plan.id, { totalSponsored: 0, totalRevenue: 0 }] as [string, SponsorshipStats];
            }
          })
        );
        setStats(Object.fromEntries(entries));
      } catch (err) {
        console.error('Error loading sponsorship plans:', err);
      }
    }
    loadPlans();
  }, []);

  const handleOptIn = async (planId: string) => {
    if (!user) {
      alert('Por favor inicia sesión para patrocinar');
      return;
    }
    setLoadingPlanId(planId);
    try {
      await SponsorshipService.optIn(planId, user.id);
      const updated = await SponsorshipService.getStats(planId);
      setStats((prev) => ({ ...prev, [planId]: updated }));
      alert('¡Patrocinio registrado! Gracias por tu apoyo.');
    } catch (err) {
      console.error('Error al registrar patrocinio:', err);
      alert('Error al registrar patrocinio. Por favor intenta de nuevo.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="sponsorship-program-page p-4">
      <h1 className="text-2xl font-semibold">Sponsorship Programs</h1>
      <ProductRecommendations
        plans={plans}
        stats={stats}
        onOptIn={handleOptIn}
        loadingPlanId={loadingPlanId}
      />
    </div>
  );
};

export default SponsorshipProgramPage;