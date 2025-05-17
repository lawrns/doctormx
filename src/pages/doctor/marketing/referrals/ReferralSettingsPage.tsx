import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabaseClient';
import ReferralService from '../../../../services/referral/ReferralService';
import type { Referral, ReferralStats } from '../../../../services/referral/types';
import DashboardLayout from '../../../../components/doctor/EnhancedDashboardLayout';
import SEO from '../../../../core/components/SEO';
import ReferralLinkGenerator from '../../../../components/connect/ReferralLinkGenerator';
import { Card } from '../../../../components/ui';

function ReferralSettingsPage() {
  const { doctorId } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, ReferralStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    supabase
      .from('referral_links')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) {
          console.error('Error loading referral links:', error);
          setReferrals([]);
        } else {
          setReferrals(data);
        }
        setLoading(false);
      });
  }, [doctorId]);

  useEffect(() => {
    referrals.forEach((link) => {
      ReferralService.getReferralStats(link.code)
        .then((stats) =>
          setStatsMap((prev) => ({ ...prev, [link.id]: stats }))
        )
        .catch((err) => console.error('Error fetching referral stats:', err));
    });
  }, [referrals]);

  return (
    <DashboardLayout title="Programa de Referidos" loading={loading}>
      <SEO
        title="Configuración del Programa de Referidos"
        description="Administra tus enlaces de referidos y consulta las estadísticas."
      />
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Generar Enlace de Referido</h2>
        <ReferralLinkGenerator />
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Estadísticas de Referidos</h2>
        {referrals.length === 0 ? (
          <p className="text-gray-600">No tienes enlaces de referidos aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Generados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Conversión
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.map((link) => {
                  const stats = statsMap[link.id];
                  const conversion = stats
                    ? `${Math.round((stats.totalUsed / Math.max(stats.totalGenerated, 1)) * 100)}%`
                    : '-';
                  return (
                    <tr key={link.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{link.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stats?.totalGenerated ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{stats?.totalUsed ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{conversion}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default ReferralSettingsPage;