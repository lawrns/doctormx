import { supabase } from '../lib/supabase';

export interface AffiliateProgram {
  id: string;
  name: string;
  description: string;
  commissionRate: number;
  minPayout: number;
  payoutMethod: 'bank_transfer' | 'paypal' | 'crypto';
  requirements: string[];
  benefits: string[];
  status: 'active' | 'inactive' | 'pending';
}

export interface AffiliateUser {
  id: string;
  userId: string;
  affiliateCode: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  joinDate: string;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalReferrals: number;
  activeReferrals: number;
  conversionRate: number;
  lastPayout: string;
  nextPayout: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  paypalEmail?: string;
  cryptoAddress?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  affiliateCode: string;
  status: 'pending' | 'active' | 'converted' | 'expired';
  joinDate: string;
  conversionDate?: string;
  commission: number;
  paid: boolean;
  metadata: {
    source: string;
    campaign?: string;
    medium?: string;
  };
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  referralId: string;
  amount: number;
  type: 'signup' | 'subscription' | 'consultation' | 'renewal';
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
  paidAt?: string;
  description: string;
}

export const AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    id: 'doctor_connect',
    name: 'Doctor Connect Program',
    description: 'Programa de afiliados para médicos y profesionales de la salud',
    commissionRate: 0.15, // 15%
    minPayout: 1000, // 1000 MXN
    payoutMethod: 'bank_transfer',
    requirements: [
      'Licencia médica válida',
      'Mínimo 2 años de experiencia',
      'Referencias profesionales',
      'Completar proceso de verificación'
    ],
    benefits: [
      'Comisión del 15% por cada paciente referido',
      'Bonificación por conversión a suscripción',
      'Acceso a herramientas de marketing',
      'Soporte dedicado',
      'Reportes detallados de referidos'
    ],
    status: 'active'
  },
  {
    id: 'influencer_program',
    name: 'Influencer Health Program',
    description: 'Programa para influencers y creadores de contenido de salud',
    commissionRate: 0.10, // 10%
    minPayout: 500, // 500 MXN
    payoutMethod: 'paypal',
    requirements: [
      'Mínimo 10,000 seguidores',
      'Contenido relacionado con salud',
      'Engagement rate > 3%',
      'Cumplir políticas de contenido'
    ],
    benefits: [
      'Comisión del 10% por referidos',
      'Bonificación por contenido viral',
      'Acceso a contenido exclusivo',
      'Colaboraciones especiales',
      'Herramientas de tracking'
    ],
    status: 'active'
  },
  {
    id: 'corporate_partnership',
    name: 'Corporate Partnership',
    description: 'Programa para empresas y organizaciones',
    commissionRate: 0.20, // 20%
    minPayout: 5000, // 5000 MXN
    payoutMethod: 'bank_transfer',
    requirements: [
      'Empresa registrada',
      'Mínimo 50 empleados',
      'Acuerdo de partnership',
      'Cumplir requisitos legales'
    ],
    benefits: [
      'Comisión del 20% por empleados referidos',
      'Descuentos corporativos',
      'Dashboard empresarial',
      'Soporte prioritario',
      'Reportes personalizados'
    ],
    status: 'active'
  }
];

export async function createAffiliateAccount(
  userId: string,
  programId: string,
  bankDetails?: any,
  paypalEmail?: string,
  cryptoAddress?: string
): Promise<AffiliateUser> {
  try {
    const program = AFFILIATE_PROGRAMS.find(p => p.id === programId);
    if (!program) {
      throw new Error('Program not found');
    }

    // Generate unique affiliate code
    const affiliateCode = await generateAffiliateCode();

    const { data, error } = await supabase
      .from('affiliate_users')
      .insert({
        user_id: userId,
        affiliate_code: affiliateCode,
        status: 'pending',
        join_date: new Date().toISOString(),
        total_earnings: 0,
        pending_earnings: 0,
        paid_earnings: 0,
        total_referrals: 0,
        active_referrals: 0,
        conversion_rate: 0,
        bank_details: bankDetails,
        paypal_email: paypalEmail,
        crypto_address: cryptoAddress
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating affiliate account:', error);
    throw error;
  }
}

export async function generateAffiliateCode(): Promise<string> {
  try {
    let code: string;
    let exists = true;

    while (exists) {
      // Generate code like "DOC123" or "HEALTH456"
      const prefix = Math.random() > 0.5 ? 'DOC' : 'HEALTH';
      const number = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      code = `${prefix}${number}`;

      const { data } = await supabase
        .from('affiliate_users')
        .select('id')
        .eq('affiliate_code', code)
        .single();

      exists = !!data;
    }

    return code;
  } catch (error) {
    console.error('Error generating affiliate code:', error);
    throw error;
  }
}

export async function getAffiliateUser(userId: string): Promise<AffiliateUser | null> {
  try {
    const { data, error } = await supabase
      .from('affiliate_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting affiliate user:', error);
    throw error;
  }
}

export async function trackReferral(
  affiliateCode: string,
  referredUserId: string,
  metadata: any = {}
): Promise<Referral> {
  try {
    // Find affiliate by code
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate_users')
      .select('*')
      .eq('affiliate_code', affiliateCode)
      .eq('status', 'approved')
      .single();

    if (affiliateError || !affiliate) {
      throw new Error('Invalid affiliate code');
    }

    // Check if user was already referred
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', referredUserId)
      .single();

    if (existingReferral) {
      throw new Error('User already referred');
    }

    // Create referral record
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: affiliate.user_id,
        referred_user_id: referredUserId,
        affiliate_code: affiliateCode,
        status: 'pending',
        join_date: new Date().toISOString(),
        commission: 0,
        paid: false,
        metadata: metadata
      })
      .select()
      .single();

    if (error) throw error;

    // Update affiliate stats
    await supabase
      .from('affiliate_users')
      .update({
        total_referrals: affiliate.total_referrals + 1,
        active_referrals: affiliate.active_referrals + 1
      })
      .eq('id', affiliate.id);

    return data;
  } catch (error) {
    console.error('Error tracking referral:', error);
    throw error;
  }
}

export async function processReferralConversion(
  referralId: string,
  conversionType: 'signup' | 'subscription' | 'consultation' | 'renewal',
  amount: number
): Promise<AffiliateCommission> {
  try {
    // Get referral details
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .single();

    if (referralError || !referral) {
      throw new Error('Referral not found');
    }

    // Get affiliate details
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate_users')
      .select('*')
      .eq('user_id', referral.referrer_id)
      .single();

    if (affiliateError || !affiliate) {
      throw new Error('Affiliate not found');
    }

    // Calculate commission
    const commissionRate = getCommissionRate(conversionType);
    const commission = amount * commissionRate;

    // Create commission record
    const { data: commissionData, error: commissionError } = await supabase
      .from('affiliate_commissions')
      .insert({
        affiliate_id: affiliate.id,
        referral_id: referralId,
        amount: commission,
        type: conversionType,
        status: 'pending',
        created_at: new Date().toISOString(),
        description: `Commission for ${conversionType}`
      })
      .select()
      .single();

    if (commissionError) throw commissionError;

    // Update referral status
    await supabase
      .from('referrals')
      .update({
        status: 'converted',
        conversion_date: new Date().toISOString(),
        commission: commission
      })
      .eq('id', referralId);

    // Update affiliate earnings
    await supabase
      .from('affiliate_users')
      .update({
        pending_earnings: affiliate.pending_earnings + commission,
        conversion_rate: calculateConversionRate(affiliate.id)
      })
      .eq('id', affiliate.id);

    return commissionData;
  } catch (error) {
    console.error('Error processing referral conversion:', error);
    throw error;
  }
}

export async function getAffiliateStats(userId: string): Promise<any> {
  try {
    const affiliate = await getAffiliateUser(userId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    // Get referrals
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);

    // Get commissions
    const { data: commissions } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliate.id);

    // Calculate stats
    const totalReferrals = referrals?.length || 0;
    const convertedReferrals = referrals?.filter(r => r.status === 'converted').length || 0;
    const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0;
    const totalEarnings = commissions?.reduce((sum, c) => sum + c.amount, 0) || 0;
    const pendingEarnings = commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0) || 0;

    return {
      affiliate,
      stats: {
        totalReferrals,
        convertedReferrals,
        conversionRate,
        totalEarnings,
        pendingEarnings,
        paidEarnings: totalEarnings - pendingEarnings
      },
      referrals: referrals || [],
      commissions: commissions || []
    };
  } catch (error) {
    console.error('Error getting affiliate stats:', error);
    throw error;
  }
}

export async function getAffiliateDashboard(userId: string): Promise<any> {
  try {
    const affiliate = await getAffiliateUser(userId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    // Get recent referrals
    const { data: recentReferrals } = await supabase
      .from('referrals')
      .select(`
        *,
        users!inner(name, email, created_at)
      `)
      .eq('referrer_id', userId)
      .order('join_date', { ascending: false })
      .limit(10);

    // Get recent commissions
    const { data: recentCommissions } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get monthly earnings
    const { data: monthlyEarnings } = await supabase
      .from('affiliate_commissions')
      .select('amount, created_at')
      .eq('affiliate_id', affiliate.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const monthlyTotal = monthlyEarnings?.reduce((sum, c) => sum + c.amount, 0) || 0;

    return {
      affiliate,
      recentReferrals: recentReferrals || [],
      recentCommissions: recentCommissions || [],
      monthlyEarnings: monthlyTotal,
      stats: {
        totalReferrals: affiliate.total_referrals,
        activeReferrals: affiliate.active_referrals,
        conversionRate: affiliate.conversion_rate,
        totalEarnings: affiliate.total_earnings,
        pendingEarnings: affiliate.pending_earnings,
        paidEarnings: affiliate.paid_earnings
      }
    };
  } catch (error) {
    console.error('Error getting affiliate dashboard:', error);
    throw error;
  }
}

export async function processPayout(affiliateId: string, amount: number): Promise<boolean> {
  try {
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate_users')
      .select('*')
      .eq('id', affiliateId)
      .single();

    if (affiliateError || !affiliate) {
      throw new Error('Affiliate not found');
    }

    if (affiliate.pending_earnings < amount) {
      throw new Error('Insufficient pending earnings');
    }

    // Update affiliate earnings
    await supabase
      .from('affiliate_users')
      .update({
        pending_earnings: affiliate.pending_earnings - amount,
        paid_earnings: affiliate.paid_earnings + amount,
        last_payout: new Date().toISOString()
      })
      .eq('id', affiliateId);

    // Mark commissions as paid
    await supabase
      .from('affiliate_commissions')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('affiliate_id', affiliateId)
      .eq('status', 'pending');

    return true;
  } catch (error) {
    console.error('Error processing payout:', error);
    throw error;
  }
}

function getCommissionRate(conversionType: string): number {
  switch (conversionType) {
    case 'signup': return 0.05; // 5%
    case 'subscription': return 0.15; // 15%
    case 'consultation': return 0.10; // 10%
    case 'renewal': return 0.12; // 12%
    default: return 0.05;
  }
}

async function calculateConversionRate(affiliateId: string): Promise<number> {
  try {
    const { data: referrals } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_id', affiliateId);

    if (!referrals || referrals.length === 0) return 0;

    const converted = referrals.filter(r => r.status === 'converted').length;
    return (converted / referrals.length) * 100;
  } catch (error) {
    console.error('Error calculating conversion rate:', error);
    return 0;
  }
}

export function getAllAffiliatePrograms(): AffiliateProgram[] {
  return AFFILIATE_PROGRAMS;
}

export function getAffiliateProgramById(programId: string): AffiliateProgram | undefined {
  return AFFILIATE_PROGRAMS.find(p => p.id === programId);
}
