import { supabase } from '../../lib/supabase';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_ADDONS } from './SubscriptionPlans';

/**
 * Service for managing doctor subscriptions
 */
export class SubscriptionService {
  /**
   * Gets a subscription plan by ID
   * @param planId The ID of the plan
   * @returns The subscription plan or null if not found
   */
  getPlanById(planId: string) {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
  }
  
  /**
   * Gets all available subscription plans
   * @returns Array of subscription plans
   */
  getAllPlans() {
    return SUBSCRIPTION_PLANS.filter(plan => !plan.legacy);
  }
  
  /**
   * Gets all available add-ons for a plan
   * @param planId The ID of the plan
   * @returns Array of compatible add-ons
   */
  getAddOnsForPlan(planId: string) {
    return SUBSCRIPTION_ADDONS.filter(addon => 
      addon.compatiblePlans.includes(planId)
    );
  }
  
  /**
   * Gets a doctor's current subscription
   * @param doctorId The ID of the doctor
   * @returns The current subscription or null if none
   */
  async getDoctorSubscription(doctorId: string): Promise<any> {
    const { data, error } = await supabase
      .from('doctor_subscriptions')
      .select('*, subscription_items(*)')
      .eq('doctor_id', doctorId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (error) {
      throw new Error(`Failed to get doctor subscription: ${error.message}`);
    }
    
    if (!data) {
      return null;
    }
    
    // Enrich with plan details
    const plan = this.getPlanById(data.plan_id);
    
    return {
      ...data,
      plan
    };
  }
  
  /**
   * Gets a doctor's subscription history
   * @param doctorId The ID of the doctor
   * @returns Array of subscription records
   */
  async getDoctorSubscriptionHistory(doctorId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('doctor_subscriptions')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get subscription history: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Creates a new subscription for a doctor
   * @param doctorId The ID of the doctor
   * @param planId The ID of the plan
   * @param paymentMethodId The ID of the payment method
   * @param addOnIds Optional array of add-on IDs to include
   * @returns The created subscription
   */
  async createSubscription(
    doctorId: string,
    planId: string,
    paymentMethodId: string,
    addOnIds: string[] = []
  ): Promise<any> {
    // Get plan
    const plan = this.getPlanById(planId);
    
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }
    
    // Calculate total price
    let totalPrice = plan.price;
    
    // Validate and add add-ons
    const selectedAddOns = [];
    
    for (const addOnId of addOnIds) {
      const addOn = SUBSCRIPTION_ADDONS.find(a => a.id === addOnId);
      
      if (!addOn) {
        throw new Error(`Invalid add-on ID: ${addOnId}`);
      }
      
      if (!addOn.compatiblePlans.includes(planId)) {
        throw new Error(`Add-on ${addOnId} is not compatible with plan ${planId}`);
      }
      
      selectedAddOns.push(addOn);
      totalPrice += addOn.price;
    }
    
    // Simulate payment processing
    console.log(`Processing payment for doctor ${doctorId}, plan ${planId}, amount ${totalPrice} MXN`);
    const paymentSuccessful = true; // In a real app, we would call a payment gateway
    
    if (!paymentSuccessful) {
      throw new Error('Payment processing failed');
    }
    
    // Calculate next billing date (1 month from now)
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    // Create subscription record
    const { data: subscription, error: subscriptionError } = await supabase
      .from('doctor_subscriptions')
      .insert({
        doctor_id: doctorId,
        plan_id: planId,
        status: 'active',
        billing_cycle: plan.billingCycle,
        current_period_start: new Date().toISOString(),
        current_period_end: nextBillingDate.toISOString(),
        payment_method_id: paymentMethodId,
        price: totalPrice,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (subscriptionError) {
      throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
    }
    
    // Create subscription items (add-ons)
    if (selectedAddOns.length > 0) {
      const { error: itemsError } = await supabase
        .from('subscription_items')
        .insert(
          selectedAddOns.map(addOn => ({
            subscription_id: subscription.id,
            item_id: addOn.id,
            item_type: 'addon',
            price: addOn.price,
            created_at: new Date().toISOString()
          }))
        );
      
      if (itemsError) {
        throw new Error(`Failed to create subscription items: ${itemsError.message}`);
      }
    }
    
    // Update doctor's feature access based on the plan
    await this.updateDoctorFeatures(doctorId, planId);
    
    return {
      ...subscription,
      plan,
      addOns: selectedAddOns
    };
  }
  
  /**
   * Cancels a doctor's subscription
   * @param doctorId The ID of the doctor
   * @param reason Optional cancellation reason
   * @returns The updated subscription
   */
  async cancelSubscription(doctorId: string, reason?: string): Promise<any> {
    // Get active subscription
    const { data: subscription, error: getError } = await supabase
      .from('doctor_subscriptions')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (getError) {
      throw new Error(`Failed to get subscription: ${getError.message}`);
    }
    
    if (!subscription) {
      throw new Error('No active subscription found');
    }
    
    // Update subscription status
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('doctor_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Failed to cancel subscription: ${updateError.message}`);
    }
    
    // Downgrade doctor's features to basic
    await this.updateDoctorFeatures(doctorId, 'basic');
    
    return updatedSubscription;
  }
  
  /**
   * Changes a doctor's subscription plan
   * @param doctorId The ID of the doctor
   * @param newPlanId The ID of the new plan
   * @param keepAddOns Whether to keep compatible add-ons
   * @returns The updated subscription
   */
  async changePlan(doctorId: string, newPlanId: string, keepAddOns: boolean = true): Promise<any> {
    // Get active subscription
    const currentSubscription = await this.getDoctorSubscription(doctorId);
    
    if (!currentSubscription) {
      throw new Error('No active subscription found');
    }
    
    // Get new plan
    const newPlan = this.getPlanById(newPlanId);
    
    if (!newPlan) {
      throw new Error(`Invalid plan ID: ${newPlanId}`);
    }
    
    // Calculate proration if needed
    // In a real app, we would calculate a proper proration based on time remaining
    
    // Handle add-ons
    let addOns = [];
    
    if (keepAddOns && currentSubscription.subscription_items) {
      // Filter to keep only compatible add-ons
      addOns = currentSubscription.subscription_items
        .filter(item => {
          const addOn = SUBSCRIPTION_ADDONS.find(a => a.id === item.item_id);
          return addOn && addOn.compatiblePlans.includes(newPlanId);
        });
    }
    
    // Calculate total price
    let totalPrice = newPlan.price;
    
    for (const item of addOns) {
      totalPrice += item.price;
    }
    
    // Calculate next billing date (keep the same cycle)
    const nextBillingDate = new Date(currentSubscription.current_period_end);
    
    // Update subscription record
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('doctor_subscriptions')
      .update({
        plan_id: newPlanId,
        price: totalPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSubscription.id)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }
    
    // Remove incompatible add-ons
    if (currentSubscription.subscription_items) {
      const incompatibleItems = currentSubscription.subscription_items
        .filter(item => {
          const addOn = SUBSCRIPTION_ADDONS.find(a => a.id === item.item_id);
          return !addOn || !addOn.compatiblePlans.includes(newPlanId);
        })
        .map(item => item.id);
      
      if (incompatibleItems.length > 0) {
        const { error: deleteError } = await supabase
          .from('subscription_items')
          .delete()
          .in('id', incompatibleItems);
        
        if (deleteError) {
          console.error('Failed to delete incompatible items:', deleteError);
        }
      }
    }
    
    // Update doctor's feature access based on the new plan
    await this.updateDoctorFeatures(doctorId, newPlanId);
    
    return {
      ...updatedSubscription,
      plan: newPlan
    };
  }
  
  /**
   * Adds an add-on to a doctor's subscription
   * @param doctorId The ID of the doctor
   * @param addOnId The ID of the add-on
   * @returns The created subscription item
   */
  async addAddOn(doctorId: string, addOnId: string): Promise<any> {
    // Get active subscription
    const currentSubscription = await this.getDoctorSubscription(doctorId);
    
    if (!currentSubscription) {
      throw new Error('No active subscription found');
    }
    
    // Get add-on
    const addOn = SUBSCRIPTION_ADDONS.find(a => a.id === addOnId);
    
    if (!addOn) {
      throw new Error(`Invalid add-on ID: ${addOnId}`);
    }
    
    // Check compatibility
    if (!addOn.compatiblePlans.includes(currentSubscription.plan_id)) {
      throw new Error(`Add-on ${addOnId} is not compatible with plan ${currentSubscription.plan_id}`);
    }
    
    // Check if already subscribed
    const existingItem = currentSubscription.subscription_items?.find(
      item => item.item_id === addOnId
    );
    
    if (existingItem) {
      throw new Error(`Already subscribed to add-on ${addOnId}`);
    }
    
    // Create subscription item
    const { data: item, error } = await supabase
      .from('subscription_items')
      .insert({
        subscription_id: currentSubscription.id,
        item_id: addOnId,
        item_type: 'addon',
        price: addOn.price,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to add add-on: ${error.message}`);
    }
    
    // Update subscription price
    const { error: updateError } = await supabase
      .from('doctor_subscriptions')
      .update({
        price: currentSubscription.price + addOn.price,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSubscription.id);
    
    if (updateError) {
      throw new Error(`Failed to update subscription price: ${updateError.message}`);
    }
    
    return {
      ...item,
      addOn
    };
  }
  
  /**
   * Removes an add-on from a doctor's subscription
   * @param doctorId The ID of the doctor
   * @param addOnId The ID of the add-on
   * @returns Success indicator
   */
  async removeAddOn(doctorId: string, addOnId: string): Promise<boolean> {
    // Get active subscription
    const currentSubscription = await this.getDoctorSubscription(doctorId);
    
    if (!currentSubscription) {
      throw new Error('No active subscription found');
    }
    
    // Check if subscribed
    const existingItem = currentSubscription.subscription_items?.find(
      item => item.item_id === addOnId
    );
    
    if (!existingItem) {
      throw new Error(`Not subscribed to add-on ${addOnId}`);
    }
    
    // Remove subscription item
    const { error } = await supabase
      .from('subscription_items')
      .delete()
      .eq('id', existingItem.id);
    
    if (error) {
      throw new Error(`Failed to remove add-on: ${error.message}`);
    }
    
    // Update subscription price
    const { error: updateError } = await supabase
      .from('doctor_subscriptions')
      .update({
        price: currentSubscription.price - existingItem.price,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSubscription.id);
    
    if (updateError) {
      throw new Error(`Failed to update subscription price: ${updateError.message}`);
    }
    
    return true;
  }
  
  /**
   * Updates a doctor's feature access based on their subscription plan
   * @param doctorId The ID of the doctor
   * @param planId The ID of the plan
   * @returns Success indicator
   */
  private async updateDoctorFeatures(doctorId: string, planId: string): Promise<boolean> {
    const plan = this.getPlanById(planId);
    
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }
    
    // Get feature flags
    const featureFlags = plan.features.reduce((flags, feature) => {
      flags[feature.id] = {
        enabled: feature.included,
        limit: feature.limit
      };
      return flags;
    }, {});
    
    // Update doctor's feature access
    const { error } = await supabase
      .from('doctors')
      .update({
        subscription_plan: planId,
        feature_flags: featureFlags,
        updated_at: new Date().toISOString()
      })
      .eq('id', doctorId);
    
    if (error) {
      throw new Error(`Failed to update doctor features: ${error.message}`);
    }
    
    return true;
  }
}

export default new SubscriptionService();