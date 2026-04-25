import { createClient } from '@/lib/supabase/server';

export interface Insurance {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  type: 'public' | 'private' | 'social_security';
  website: string | null;
  phone: string | null;
  is_active: boolean;
}

export interface DoctorInsurance {
  id: string;
  doctor_id: string;
  insurance_id: string;
  plan_name: string | null;
  notes: string | null;
  insurance: Insurance;
}

export async function getInsurances(type?: string): Promise<Insurance[]> {
  const supabase = await createClient();
  let query = supabase.from('insurances').select('*').eq('is_active', true).order('name');
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getInsuranceBySlug(slug: string): Promise<Insurance | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('insurances').select('*').eq('slug', slug).single();
  if (error) return null;
  return data;
}

export async function getDoctorInsurances(doctorId: string): Promise<DoctorInsurance[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('doctor_insurances')
    .select('*, insurance:insurances(*)')
    .eq('doctor_id', doctorId);
  if (error) throw error;
  return data;
}

export async function setDoctorInsurances(doctorId: string, insuranceIds: string[]): Promise<void> {
  const supabase = await createClient();
  await supabase.from('doctor_insurances').delete().eq('doctor_id', doctorId);
  if (insuranceIds.length > 0) {
    const rows = insuranceIds.map((insurance_id) => ({ doctor_id: doctorId, insurance_id }));
    await supabase.from('doctor_insurances').insert(rows);
  }
}

export async function getDoctorsByInsurance(insuranceSlug: string, limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('doctor_insurances')
    .select('doctor_id, insurances!inner(slug)')
    .eq('insurances.slug', insuranceSlug)
    .limit(limit);
  if (error) throw error;
  return data.map((d: { doctor_id: string }) => d.doctor_id);
}
