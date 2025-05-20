import React, { useState } from 'react';
import { Check, X, Star, ArrowRight, HelpCircle } from 'lucide-react';
import { SUBSCRIPTION_PLANS, PlanFeature } from '../../services/subscription/SubscriptionPlans';

interface SubscriptionPlansProps {
  currentPlanId?: string;
  onSelectPlan?: (planId: string) => void;
  isYearly?: boolean;
}

/**
 * Component for displaying subscription plan options
 */
const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentPlanId,
  onSelectPlan,
  isYearly = false
}) => {
  // Filter to only show non-legacy plans
  const plans = SUBSCRIPTION_PLANS.filter(plan => !plan.legacy);
  
  // Find the most popular plan if no current plan is selected
  const popularPlanId = plans.find(plan => plan.popular)?.id;
  
  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };
  
  // Function to render feature check/x
  const renderFeatureAvailability = (feature: PlanFeature) => {
    if (!feature.included) {
      return <X size={20} className="text-gray-300" />;
    }
    
    if (feature.limit === null) {
      return <Check size={20} className="text-green-500" />;
    }
    
    return (
      <span className="text-sm font-medium text-gray-900">
        {feature.limit}
      </span>
    );
  };
  
  return (
    <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 lg:max-w-6xl lg:mx-auto">
      {plans.map((plan) => {
        const isPlanSelected = currentPlanId === plan.id;
        const isPopular = plan.popular || (!currentPlanId && plan.id === popularPlanId);
        
        return (
          <div 
            key={plan.id}
            className={`rounded-lg shadow-sm divide-y divide-gray-200 ${
              isPopular 
                ? 'border-2 border-blue-500' 
                : 'border border-gray-200'
            }`}
          >
            {isPopular && (
              <div className="p-2 bg-blue-500 text-white text-center text-xs font-medium uppercase tracking-wider rounded-t-lg">
                Popular
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900">{plan.name}</h2>
              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
              
              <p className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${isYearly ? Math.round(plan.price * 10) : plan.price}
                </span>
                <span className="text-base font-medium text-gray-500">
                  /mes
                </span>
              </p>
              
              {isYearly && (
                <p className="mt-1.5 text-sm text-green-600">
                  Ahorra 2 meses al año con pago anual
                </p>
              )}
              
              <div className="mt-6">
                <div className="rounded-md shadow">
                  {isPlanSelected ? (
                    <span 
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 cursor-default"
                    >
                      Plan actual
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {plan.id === 'basic' ? 'Seleccionar' : 'Actualizar'}
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 pt-6 pb-8">
              <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                Incluido en este plan
              </h3>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => {
                  // Skip features that aren't included and aren't highlighted
                  if (!feature.included && !feature.highlighted) {
                    return null;
                  }
                  
                  return (
                    <li key={feature.id} className="flex space-x-3">
                      <div className="w-5 flex-shrink-0 flex items-center justify-center">
                        {renderFeatureAvailability(feature)}
                      </div>
                      <span 
                        className={`text-sm ${
                          feature.included 
                            ? 'text-gray-800' 
                            : 'text-gray-500 line-through'
                        } ${feature.highlighted ? 'font-medium' : ''}`}
                      >
                        {feature.name}
                        {feature.limit && feature.limit > 0 && feature.included && (
                          <span className="ml-1">
                            ({feature.limit})
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubscriptionPlans;