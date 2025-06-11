import { supabase } from '../../lib/supabase';

export interface DoctorEarnings {
  id: string;
  doctor_id: string;
  session_id: string;
  amount: number;
  date: string;
  month: number;
  year: number;
  status: 'pending' | 'paid' | 'hold';
  payout_date?: string;
  created_at: string;
}

export interface EarningsAnalytics {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  dailyEarnings: number;
  totalConsultations: number;
  averagePerConsultation: number;
  pendingPayments: number;
  paidThisMonth: number;
  growthRate: number;
  earningsByDay: { date: string; amount: number; consultations: number }[];
  earningsByMonth: { month: string; amount: number; consultations: number }[];
}

export interface PayoutSchedule {
  doctorId: string;
  schedule: 'weekly' | 'biweekly' | 'monthly';
  nextPayoutDate: string;
  minimumAmount: number;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  };
}

export class DoctorEarningsService {

  /**
   * Get doctor's earnings for a specific period
   */
  static async getDoctorEarnings(
    doctorId: string,
    startDate?: string,
    endDate?: string,
    status?: 'pending' | 'paid' | 'hold'
  ): Promise<DoctorEarnings[]> {
    try {
      let query = supabase
        .from('doctor_earnings')
        .select('*')
        .eq('doctor_id', doctorId);

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;
      return data as DoctorEarnings[];
    } catch (error) {
      console.error('Error fetching doctor earnings:', error);
      return [];
    }
  }

  /**
   * Get comprehensive earnings analytics for a doctor
   */
  static async getEarningsAnalytics(doctorId: string): Promise<EarningsAnalytics> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const today = new Date().toISOString().split('T')[0];
      
      // Get current month earnings
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      
      // Get previous month for growth comparison
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

      // Fetch all earnings data
      const { data: allEarnings, error } = await supabase
        .from('doctor_earnings')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const earnings = allEarnings as DoctorEarnings[];

      // Calculate totals
      const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
      const monthlyEarnings = earnings
        .filter(e => e.date >= startOfMonth)
        .reduce((sum, e) => sum + e.amount, 0);
      const weeklyEarnings = earnings
        .filter(e => e.date >= sevenDaysAgo.toISOString().split('T')[0])
        .reduce((sum, e) => sum + e.amount, 0);
      const dailyEarnings = earnings
        .filter(e => e.date === today)
        .reduce((sum, e) => sum + e.amount, 0);

      // Consultation stats
      const totalConsultations = earnings.length;
      const averagePerConsultation = totalConsultations > 0 ? totalEarnings / totalConsultations : 0;

      // Payment status
      const pendingPayments = earnings
        .filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.amount, 0);
      const paidThisMonth = earnings
        .filter(e => e.status === 'paid' && e.date >= startOfMonth)
        .reduce((sum, e) => sum + e.amount, 0);

      // Growth rate calculation
      const previousMonthEarnings = await this.getMonthlyEarnings(doctorId, startOfPrevMonth, endOfPrevMonth);
      const growthRate = previousMonthEarnings > 0 
        ? ((monthlyEarnings - previousMonthEarnings) / previousMonthEarnings) * 100 
        : 0;

      // Daily breakdown (last 30 days)
      const earningsByDay = this.groupEarningsByDay(earnings, thirtyDaysAgo);

      // Monthly breakdown (last 12 months)
      const earningsByMonth = await this.getMonthlyBreakdown(doctorId, 12);

      return {
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        dailyEarnings,
        totalConsultations,
        averagePerConsultation,
        pendingPayments,
        paidThisMonth,
        growthRate,
        earningsByDay,
        earningsByMonth
      };
    } catch (error) {
      console.error('Error calculating earnings analytics:', error);
      return {
        totalEarnings: 0,
        monthlyEarnings: 0,
        weeklyEarnings: 0,
        dailyEarnings: 0,
        totalConsultations: 0,
        averagePerConsultation: 0,
        pendingPayments: 0,
        paidThisMonth: 0,
        growthRate: 0,
        earningsByDay: [],
        earningsByMonth: []
      };
    }
  }

  /**
   * Process payout for a doctor
   */
  static async processPayout(
    doctorId: string,
    amount: number,
    earningsIds: string[]
  ): Promise<boolean> {
    try {
      const payoutDate = new Date().toISOString();

      // Update earnings status to 'paid'
      const { error } = await supabase
        .from('doctor_earnings')
        .update({
          status: 'paid',
          payout_date: payoutDate
        })
        .in('id', earningsIds)
        .eq('doctor_id', doctorId);

      if (error) throw error;

      // In a real implementation, this would:
      // 1. Integrate with payment processor (Stripe, PayPal, bank transfer)
      // 2. Handle tax calculations and deductions
      // 3. Generate payout receipts
      // 4. Send notifications to doctor

      return true;
    } catch (error) {
      console.error('Error processing payout:', error);
      return false;
    }
  }

  /**
   * Get pending payouts for a doctor
   */
  static async getPendingPayouts(doctorId: string): Promise<{
    totalAmount: number;
    earningsCount: number;
    oldestPendingDate: string;
    canPayout: boolean;
  }> {
    try {
      const { data: pendingEarnings, error } = await supabase
        .from('doctor_earnings')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('status', 'pending')
        .order('date', { ascending: true });

      if (error) throw error;

      const totalAmount = pendingEarnings.reduce((sum, e) => sum + e.amount, 0);
      const earningsCount = pendingEarnings.length;
      const oldestPendingDate = pendingEarnings.length > 0 ? pendingEarnings[0].date : '';
      
      // Minimum payout threshold
      const canPayout = totalAmount >= 100; // 100 MXN minimum

      return {
        totalAmount,
        earningsCount,
        oldestPendingDate,
        canPayout
      };
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      return {
        totalAmount: 0,
        earningsCount: 0,
        oldestPendingDate: '',
        canPayout: false
      };
    }
  }

  /**
   * Get doctor's payout schedule
   */
  static async getPayoutSchedule(doctorId: string): Promise<PayoutSchedule | null> {
    try {
      // In a real implementation, this would be stored in a separate table
      // For now, return default schedule
      const nextFriday = this.getNextFriday();
      
      return {
        doctorId,
        schedule: 'weekly',
        nextPayoutDate: nextFriday.toISOString().split('T')[0],
        minimumAmount: 100 // 100 MXN minimum
      };
    } catch (error) {
      console.error('Error fetching payout schedule:', error);
      return null;
    }
  }

  /**
   * Update payout schedule for a doctor
   */
  static async updatePayoutSchedule(
    doctorId: string,
    schedule: 'weekly' | 'biweekly' | 'monthly',
    minimumAmount: number = 100
  ): Promise<boolean> {
    try {
      // In a real implementation, this would update a payout_schedules table
      // For now, we'll just validate the input and return success
      
      if (minimumAmount < 50) {
        throw new Error('Minimum amount must be at least 50 MXN');
      }

      // TODO: Implement actual database update
      console.log('Updated payout schedule:', { doctorId, schedule, minimumAmount });
      
      return true;
    } catch (error) {
      console.error('Error updating payout schedule:', error);
      return false;
    }
  }

  /**
   * Get earnings summary by specialty
   */
  static async getEarningsBySpecialty(): Promise<{
    specialty: string;
    totalEarnings: number;
    avgEarningsPerDoctor: number;
    consultationsCount: number;
  }[]> {
    try {
      const { data, error } = await supabase
        .from('doctor_earnings')
        .select(`
          amount,
          doctor_profiles!inner(especialidad)
        `)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) throw error;

      // Group by specialty
      const specialtyGroups = data.reduce((acc: any, item: any) => {
        const specialty = item.doctor_profiles.especialidad || 'General';
        if (!acc[specialty]) {
          acc[specialty] = {
            specialty,
            totalEarnings: 0,
            consultations: 0,
            doctors: new Set()
          };
        }
        
        acc[specialty].totalEarnings += item.amount;
        acc[specialty].consultations += 1;
        
        return acc;
      }, {});

      return Object.values(specialtyGroups).map((group: any) => ({
        specialty: group.specialty,
        totalEarnings: group.totalEarnings,
        avgEarningsPerDoctor: group.totalEarnings / group.doctors.size || 0,
        consultationsCount: group.consultations
      }));
    } catch (error) {
      console.error('Error fetching earnings by specialty:', error);
      return [];
    }
  }

  /**
   * Subscribe to earnings updates
   */
  static subscribeToEarnings(doctorId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`doctor-earnings-${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_earnings',
          filter: `doctor_id=eq.${doctorId}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Helper: Get monthly earnings for specific period
   */
  private static async getMonthlyEarnings(
    doctorId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('doctor_earnings')
        .select('amount')
        .eq('doctor_id', doctorId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;
      return data.reduce((sum, e) => sum + e.amount, 0);
    } catch (error) {
      console.error('Error fetching monthly earnings:', error);
      return 0;
    }
  }

  /**
   * Helper: Group earnings by day
   */
  private static groupEarningsByDay(
    earnings: DoctorEarnings[],
    startDate: Date
  ): { date: string; amount: number; consultations: number }[] {
    const dailyEarnings = new Map<string, { amount: number; consultations: number }>();

    // Initialize all days with 0
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyEarnings.set(dateStr, { amount: 0, consultations: 0 });
    }

    // Populate with actual earnings
    earnings.forEach(earning => {
      const existing = dailyEarnings.get(earning.date) || { amount: 0, consultations: 0 };
      dailyEarnings.set(earning.date, {
        amount: existing.amount + earning.amount,
        consultations: existing.consultations + 1
      });
    });

    return Array.from(dailyEarnings.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      consultations: data.consultations
    }));
  }

  /**
   * Helper: Get monthly breakdown for specified number of months
   */
  private static async getMonthlyBreakdown(
    doctorId: string,
    months: number
  ): Promise<{ month: string; amount: number; consultations: number }[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - months);

      const { data, error } = await supabase
        .from('doctor_earnings')
        .select('amount, month, year')
        .eq('doctor_id', doctorId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('year', { ascending: true })
        .order('month', { ascending: true });

      if (error) throw error;

      // Group by month/year
      const monthlyGroups = new Map<string, { amount: number; consultations: number }>();

      data.forEach(earning => {
        const monthKey = `${earning.year}-${earning.month.toString().padStart(2, '0')}`;
        const existing = monthlyGroups.get(monthKey) || { amount: 0, consultations: 0 };
        monthlyGroups.set(monthKey, {
          amount: existing.amount + earning.amount,
          consultations: existing.consultations + 1
        });
      });

      return Array.from(monthlyGroups.entries()).map(([month, data]) => ({
        month,
        amount: data.amount,
        consultations: data.consultations
      }));
    } catch (error) {
      console.error('Error fetching monthly breakdown:', error);
      return [];
    }
  }

  /**
   * Helper: Get next Friday for weekly payouts
   */
  private static getNextFriday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // 5 = Friday
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday;
  }

  /**
   * Generate earnings report for tax purposes
   */
  static async generateTaxReport(
    doctorId: string,
    year: number
  ): Promise<{
    totalEarnings: number;
    totalConsultations: number;
    monthlyBreakdown: { month: number; earnings: number; consultations: number }[];
    taxInfo: {
      platformFees: number;
      netEarnings: number;
      estimatedTax: number;
    };
  }> {
    try {
      const { data, error } = await supabase
        .from('doctor_earnings')
        .select('amount, month')
        .eq('doctor_id', doctorId)
        .eq('year', year)
        .eq('status', 'paid');

      if (error) throw error;

      const totalEarnings = data.reduce((sum, e) => sum + e.amount, 0);
      const totalConsultations = data.length;

      // Group by month
      const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
        const monthData = data.filter(e => e.month === i + 1);
        return {
          month: i + 1,
          earnings: monthData.reduce((sum, e) => sum + e.amount, 0),
          consultations: monthData.length
        };
      });

      // Calculate tax info (simplified - consult tax professional)
      const platformFees = totalEarnings * 0.1; // 10% platform fee
      const netEarnings = totalEarnings - platformFees;
      const estimatedTax = netEarnings * 0.16; // Estimated 16% tax rate in Mexico

      return {
        totalEarnings,
        totalConsultations,
        monthlyBreakdown,
        taxInfo: {
          platformFees,
          netEarnings,
          estimatedTax
        }
      };
    } catch (error) {
      console.error('Error generating tax report:', error);
      throw error;
    }
  }
}