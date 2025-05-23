import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, Users, Shield, Star, Check, X, Calendar, 
  TrendingUp, Heart, Video, TestTube, Stethoscope,
  CreditCard, AlertTriangle, Gift
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionService, { SubscriptionTier, SUBSCRIPTION_TIERS } from '../../services/SubscriptionService';
import Button from '../ui/Button';

interface SubscriptionManagementProps {
  onUpgrade?: (tier: string) => void;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ onUpgrade }) => {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [subscription, analyticsData] = await Promise.all([
        subscriptionService.getUserSubscription(user.id),
        subscriptionService.getSubscriptionAnalytics(user.id)
      ]);
      
      setCurrentSubscription(subscription);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tierName: string) => {
    if (!user) return;

    try {
      const { sessionUrl } = await subscriptionService.createCheckoutSession(user.id, tierName);
      if (onUpgrade) {
        onUpgrade(tierName);
      } else {
        window.open(sessionUrl, '_blank');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  const TierIcon = ({ tier }: { tier: string }) => {
    switch (tier) {
      case 'free':
        return <Heart className="w-6 h-6 text-teal-600" />;
      case 'premium':
        return <Crown className="w-6 h-6 text-yellow-600" />;
      case 'family':
        return <Users className="w-6 h-6 text-purple-600" />;
      default:
        return <Shield className="w-6 h-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const currentTier = analytics?.currentTier || SUBSCRIPTION_TIERS.free;
  const isCurrentTier = (tier: string) => currentTier.id === tier;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Pricing Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Planes diseñados específicamente para las necesidades de salud mexicanas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {Object.values(SUBSCRIPTION_TIERS).map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg p-8 transition-all hover:shadow-xl ${
                tier.id === 'premium' 
                  ? 'ring-2 ring-teal-500 scale-105' 
                  : ''
              } ${isCurrentTier(tier.id) ? 'bg-gradient-to-br from-teal-50 to-blue-50' : ''}`}
            >
              {tier.id === 'premium' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TierIcon tier={tier.id} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${tier.price_mxn}
                  <span className="text-lg font-normal text-gray-600"> MXN</span>
                </div>
                <p className="text-gray-600">por mes</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Consultas mensuales:</span>
                  <span className="font-semibold">
                    {tier.consultations_per_month === 'unlimited' ? 'Ilimitadas' : tier.consultations_per_month}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Almacenamiento:</span>
                  <span className="font-semibold">{tier.storage_limit_mb} MB</span>
                </div>

                {tier.family_members && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Miembros familia:</span>
                    <span className="font-semibold">{tier.family_members}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Características incluidas:</p>
                  <div className="space-y-2">
                    {tier.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-teal-600" />
                        <span className="text-sm text-gray-700">
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                    {tier.features.length > 4 && (
                      <p className="text-xs text-gray-500 ml-6">
                        +{tier.features.length - 4} características más
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {isCurrentTier(tier.id) ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    Plan Actual
                  </Button>
                ) : tier.id === 'free' ? (
                  <Button
                    variant="ghost"
                    className="w-full"
                    disabled
                  >
                    Plan Gratuito
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleUpgrade(tier.id)}
                  >
                    {currentTier.id === 'free' ? 'Comenzar' : 'Actualizar'} Plan
                  </Button>
                )}

                {tier.id !== 'free' && (
                  <p className="text-xs text-gray-500 text-center">
                    Cancela en cualquier momento
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mexican Healthcare Integration Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Integración con Sistema de Salud Mexicano
            </h3>
            <p className="text-gray-600">
              Todos nuestros planes están diseñados para funcionar con IMSS, ISSSTE y el sistema de salud mexicano.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionManagement; 