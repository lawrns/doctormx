// Analytics Library - Platform-wide metrics and analytics
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, format, eachMonthOfInterval, startOfDay, endOfDay, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

export interface AdminMetrics {
  revenue: {
    mrr: number
    arr: number
    mrrGrowth: number
    monthlyRevenue: Array<{ month: string; revenue: number }>
  }
  doctors: {
    total: number
    newThisMonth: number
    churnRate: number
    activeThisMonth: number
  }
  patients: {
    total: number
    newThisMonth: number
    retentionRate: number
  }
  appointments: {
    total: number
    completed: number
    cancelled: number
    noShow: number
    completionRate: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  conversion: {
    visitToBook: number
    bookToPay: number
    payToComplete: number
    overall: number
  }
}

export interface DoctorMetrics {
  consultations: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  revenue: {
    gross: number
    net: number
    thisMonth: number
    lastMonth: number
    platformFee: number
    growth: number
  }
  rating: {
    average: number
    totalReviews: number
    trend: number
  }
  patients: {
    unique: number
    returning: number
    retentionRate: number
  }
  appointments: {
    byStatus: Record<string, number>
    noShowRate: number
    avgDuration: number
  }
  peakHours: Array<{ hour: number; count: number }>
  revenueHistory: Array<{ month: string; revenue: number }>
}

export interface RevenueMetrics {
  total: number
  byMonth: Array<{ month: string; amount: number; count: number }>
  bySpecialty: Array<{ specialty: string; revenue: number; percentage: number }>
  byCity: Array<{ city: string; revenue: number; percentage: number }>
  averageTransaction: number
}

export interface UserMetrics {
  acquisition: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
    bySource: Array<{ source: string; count: number }>
  }
  retention: {
    rate: number
    avgSessionsPerUser: number
    churnRate: number
  }
  engagement: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
  }
}

export interface AppointmentMetrics {
  trends: Array<{ date: string; appointments: number; completed: number; cancelled: number }>
  bySpecialty: Array<{ specialty: string; count: number; percentage: number }>
  byCity: Array<{ city: string; count: number; percentage: number }>
  avgWaitTime: number
  avgDuration: number
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const supabase = await createClient()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const [doctorResult, patientResult, appointmentResult] = await Promise.all([
    supabase.from('doctors').select('id, created_at', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('profiles').select('id, created_at', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('appointments').select('id, status, created_at', { count: 'exact', head: true }),
  ])

  const totalDoctors = doctorResult.count || 0
  const totalPatients = patientResult.count || 0
  const totalAppointments = appointmentResult.count || 0

  const completedCount = appointmentResult.count || 0

  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('amount_cents, created_at')
    .eq('status', 'paid')
    .gte('created_at', startOfMonth(subMonths(now, 11)).toISOString())

  const { data: paymentsThisMonth } = await supabase
    .from('payments')
    .select('amount_cents')
    .eq('status', 'paid')
    .gte('created_at', monthStart.toISOString())
    .lt('created_at', monthEnd.toISOString())

  const { data: paymentsLastMonth } = await supabase
    .from('payments')
    .select('amount_cents')
    .eq('status', 'paid')
    .gte('created_at', lastMonthStart.toISOString())
    .lt('created_at', lastMonthEnd.toISOString())

  const { count: newDoctorsThisMonth } = await supabase
    .from('doctors')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('created_at', monthStart.toISOString())

  const { count: newPatientsThisMonth } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'patient')
    .gte('created_at', monthStart.toISOString())

  const { count: appointmentsThisMonth } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .gte('start_ts', monthStart.toISOString())
    .lt('start_ts', monthEnd.toISOString())

  const { count: appointmentsLastMonth } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .gte('start_ts', lastMonthStart.toISOString())
    .lt('start_ts', lastMonthEnd.toISOString())

  const mrr = paymentsThisMonth?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const lastMonthMrr = paymentsLastMonth?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const mrrGrowth = lastMonthMrr > 0 ? ((mrr - lastMonthMrr) / lastMonthMrr) * 100 : 0

  const monthlyRevenue = eachMonthOfInterval({
    start: subMonths(now, 11),
    end: now,
  }).map(month => {
    const monthStartStr = startOfMonth(month).toISOString()
    const monthEndStr = endOfMonth(month).toISOString()
    const monthPayments = monthlyPayments?.filter(p => 
      p.created_at >= monthStartStr && p.created_at < monthEndStr
    ) || []
    return {
      month: format(month, 'MMM yyyy', { locale: es }),
      revenue: monthPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100,
    }
  })

  return {
    revenue: {
      mrr: mrr / 100,
      arr: (mrr / 100) * 12,
      mrrGrowth,
      monthlyRevenue,
    },
    doctors: {
      total: totalDoctors,
      newThisMonth: newDoctorsThisMonth || 0,
      churnRate: 0,
      activeThisMonth: 0,
    },
    patients: {
      total: totalPatients,
      newThisMonth: newPatientsThisMonth || 0,
      retentionRate: 0,
    },
    appointments: {
      total: totalAppointments,
      completed: completedCount,
      cancelled: 0,
      noShow: 0,
      completionRate: 0,
      thisMonth: appointmentsThisMonth || 0,
      lastMonth: appointmentsLastMonth || 0,
      growth: appointmentsLastMonth ? ((appointmentsThisMonth || 0) - appointmentsLastMonth) / appointmentsLastMonth * 100 : 0,
    },
    conversion: {
      visitToBook: 0,
      bookToPay: 0,
      payToComplete: 0,
      overall: 0,
    },
  }
}

export async function getDoctorMetrics(doctorId: string): Promise<DoctorMetrics> {
  const supabase = await createClient()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))
  const sixMonthsAgo = startOfMonth(subMonths(now, 5))

  const { count: totalConsultations } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)

  const { count: thisMonthConsultations } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .gte('start_ts', monthStart.toISOString())
    .lt('start_ts', monthEnd.toISOString())

  const { count: lastMonthConsultations } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .gte('start_ts', lastMonthStart.toISOString())
    .lt('start_ts', lastMonthEnd.toISOString())

  // Get all appointments for this doctor first to join with payments
  const { data: doctorAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctorId)

  const appointmentIds = doctorAppointments?.map(a => a.id) || []

  const { data: payments } = await supabase
    .from('payments')
    .select('amount_cents, fee_cents, created_at')
    .eq('status', 'paid')
    .in('appointment_id', appointmentIds)

  const { data: paymentsThisMonth } = await supabase
    .from('payments')
    .select('amount_cents, fee_cents')
    .eq('status', 'paid')
    .in('appointment_id', appointmentIds)
    .gte('created_at', monthStart.toISOString())
    .lt('created_at', monthEnd.toISOString())

  const { data: paymentsLastMonth } = await supabase
    .from('payments')
    .select('amount_cents, fee_cents')
    .eq('status', 'paid')
    .in('appointment_id', appointmentIds)
    .gte('created_at', lastMonthStart.toISOString())
    .lt('created_at', lastMonthEnd.toISOString())

  const { data: appointmentsByStatus } = await supabase
    .from('appointments')
    .select('status')
    .eq('doctor_id', doctorId)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, created_at')
    .eq('doctor_id', doctorId)

  const revenueHistory = eachMonthOfInterval({ start: sixMonthsAgo, end: now }).map(month => {
    const monthStartStr = startOfMonth(month).toISOString()
    const monthEndStr = endOfMonth(month).toISOString()
    const monthPayments = payments?.filter(p => 
      p.created_at >= monthStartStr && p.created_at < monthEndStr
    ) || []
    return {
      month: format(month, 'MMM', { locale: es }),
      revenue: monthPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100,
    }
  })

  const grossRevenue = payments?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const platformFee = payments?.reduce((sum, p) => sum + (p.fee_cents || 0), 0) || 0

  const thisMonthGross = paymentsThisMonth?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0
  const thisMonthFee = paymentsThisMonth?.reduce((sum, p) => sum + (p.fee_cents || 0), 0) || 0
  const lastMonthGross = paymentsLastMonth?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0

  const byStatus = appointmentsByStatus?.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const cancelled = byStatus['cancelled'] || 0
  const noShow = byStatus['no_show'] || 0
  const total = totalConsultations || 1
  const noShowRate = ((cancelled + noShow) / total) * 100

  const avgRating = reviews?.length 
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
    : 0

  return {
    consultations: {
      total: totalConsultations || 0,
      thisMonth: thisMonthConsultations || 0,
      lastMonth: lastMonthConsultations || 0,
      growth: lastMonthConsultations ? ((thisMonthConsultations || 0) - lastMonthConsultations) / lastMonthConsultations * 100 : 0,
    },
    revenue: {
      gross: grossRevenue / 100,
      net: (grossRevenue - platformFee) / 100,
      thisMonth: (thisMonthGross - thisMonthFee) / 100,
      lastMonth: lastMonthGross / 100,
      platformFee: platformFee / 100,
      growth: lastMonthGross > 0 ? ((thisMonthGross - lastMonthGross) / lastMonthGross) * 100 : 0,
    },
    rating: {
      average: avgRating,
      totalReviews: reviews?.length || 0,
      trend: 0,
    },
    patients: {
      unique: 0,
      returning: 0,
      retentionRate: 0,
    },
    appointments: {
      byStatus,
      noShowRate,
      avgDuration: 30,
    },
    peakHours: [],
    revenueHistory,
  }
}

export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  const supabase = await createClient()
  const now = new Date()
  const twelveMonthsAgo = startOfMonth(subMonths(now, 11))

  // Single query with JOINs to get payment data with doctor info
  const { data: paymentsWithDoctors } = await supabase
    .from('payments')
    .select(`
      amount_cents,
      created_at,
      appointment:appointments!payments_appointment_id_fkey (
        doctor_id,
        doctor:doctors!appointments_doctor_id_fkey (
          specialty,
          city
        )
      )
    `)
    .eq('status', 'paid')
    .gte('created_at', twelveMonthsAgo.toISOString())

  // Type for nested join data
  type PaymentWithDoctor = {
    amount_cents: number
    created_at: string
    appointment: {
      doctor_id: string
      doctor: {
        specialty: string | null
        city: string | null
      } | null
    } | null
  }

  const payments = (paymentsWithDoctors || []) as unknown as PaymentWithDoctor[]

  const total = payments.reduce((sum, p) => sum + (p.amount_cents || 0), 0)

  const byMonth = eachMonthOfInterval({ start: twelveMonthsAgo, end: now }).map(month => {
    const monthStartStr = startOfMonth(month).toISOString()
    const monthEndStr = endOfMonth(month).toISOString()
    const monthPayments = payments.filter(p =>
      p.created_at >= monthStartStr && p.created_at < monthEndStr
    )
    return {
      month: format(month, 'MMM yyyy', { locale: es }),
      amount: monthPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100,
      count: monthPayments.length,
    }
  })

  // Aggregate revenue by doctor directly from joined data
  const doctorRevenue = new Map<string, number>()
  const doctorSpecialtyMap = new Map<string, string>()
  const doctorCityMap = new Map<string, string>()

  payments.forEach(p => {
    const doctorId = p.appointment?.doctor_id
    if (doctorId) {
      const current = doctorRevenue.get(doctorId) || 0
      doctorRevenue.set(doctorId, current + (p.amount_cents || 0))

      // Cache specialty and city for this doctor
      if (p.appointment?.doctor) {
        if (!doctorSpecialtyMap.has(doctorId)) {
          doctorSpecialtyMap.set(doctorId, p.appointment.doctor.specialty || 'General')
        }
        if (!doctorCityMap.has(doctorId)) {
          doctorCityMap.set(doctorId, p.appointment.doctor.city || 'Unknown')
        }
      }
    }
  })

  // Aggregate by specialty
  const specialtyRevenue = new Map<string, number>()
  doctorRevenue.forEach((revenue, doctorId) => {
    const specialty = doctorSpecialtyMap.get(doctorId) || 'General'
    specialtyRevenue.set(specialty, (specialtyRevenue.get(specialty) || 0) + revenue)
  })

  const bySpecialty = Array.from(specialtyRevenue.entries())
    .map(([specialty, revenue]) => ({ specialty, revenue, percentage: total > 0 ? (revenue / (total / 100)) * 100 : 0 }))
    .sort((a, b) => b.revenue - a.revenue)

  // Aggregate by city
  const cityRevenue = new Map<string, number>()
  doctorRevenue.forEach((revenue, doctorId) => {
    const city = doctorCityMap.get(doctorId) || 'Unknown'
    cityRevenue.set(city, (cityRevenue.get(city) || 0) + revenue)
  })

  const byCity = Array.from(cityRevenue.entries())
    .map(([city, revenue]) => ({ city, revenue, percentage: total > 0 ? (revenue / (total / 100)) * 100 : 0 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  return {
    total: total / 100,
    byMonth,
    bySpecialty,
    byCity,
    averageTransaction: payments.length ? (total / payments.length) / 100 : 0,
  }
}

export async function getUserMetrics(): Promise<UserMetrics> {
  const supabase = await createClient()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))

  const { count: totalPatients } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'patient')

  const { count: newPatientsThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'patient')
    .gte('created_at', monthStart.toISOString())

  const { count: newPatientsLastMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'patient')
    .gte('created_at', lastMonthStart.toISOString())
    .lt('created_at', monthStart.toISOString())

  const growth = newPatientsLastMonth ? ((newPatientsThisMonth || 0) - newPatientsLastMonth) / newPatientsLastMonth * 100 : 0

  return {
    acquisition: {
      total: totalPatients || 0,
      thisMonth: newPatientsThisMonth || 0,
      lastMonth: newPatientsLastMonth || 0,
      growth,
      bySource: [{ source: 'Directo', count: newPatientsThisMonth || 0 }],
    },
    retention: {
      rate: 0,
      avgSessionsPerUser: 0,
      churnRate: 0,
    },
    engagement: {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
    },
  }
}

export async function getAppointmentMetrics(): Promise<AppointmentMetrics> {
  const supabase = await createClient()
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  // Single query with JOIN to get appointments with doctor data
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      status,
      start_ts,
      doctor:doctors!appointments_doctor_id_fkey (
        specialty,
        city
      )
    `)
    .gte('start_ts', thirtyDaysAgo.toISOString())
    .lte('start_ts', now.toISOString())

  // Type for nested join data
  type AppointmentWithDoctor = {
    id: string
    status: string
    start_ts: string
    doctor: {
      specialty: string | null
      city: string | null
    } | null
  }

  const aptData = (appointments || []) as unknown as AppointmentWithDoctor[]

  const trends = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(now, 29 - i)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)
    const dayAppointments = aptData.filter(a =>
      a.start_ts >= dayStart.toISOString() && a.start_ts <= dayEnd.toISOString()
    )
    return {
      date: format(date, 'dd MMM', { locale: es }),
      appointments: dayAppointments.length,
      completed: dayAppointments.filter(a => a.status === 'completed').length,
      cancelled: dayAppointments.filter(a => a.status === 'cancelled').length,
    }
  })

  const specialtyCount = new Map<string, number>()
  const cityCount = new Map<string, number>()

  aptData.forEach(apt => {
    if (apt.doctor) {
      const specialty = apt.doctor.specialty || 'General'
      specialtyCount.set(specialty, (specialtyCount.get(specialty) || 0) + 1)
      const city = apt.doctor.city || 'Unknown'
      cityCount.set(city, (cityCount.get(city) || 0) + 1)
    }
  })

  const total = aptData.length || 1

  const bySpecialty = Array.from(specialtyCount.entries())
    .map(([specialty, count]) => ({ specialty, count, percentage: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count)

  const byCity = Array.from(cityCount.entries())
    .map(([city, count]) => ({ city, count, percentage: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    trends,
    bySpecialty,
    byCity,
    avgWaitTime: 0,
    avgDuration: 30,
  }
}

export async function exportAnalyticsData(type: 'admin' | 'doctor', doctorId?: string) {
  const metrics = type === 'admin' 
    ? await getAdminMetrics()
    : doctorId ? await getDoctorMetrics(doctorId) : null

  return metrics
}

