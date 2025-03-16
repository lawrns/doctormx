import { supabase } from '../../supabase';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  city: string;
  state: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rating?: number;
  image_url?: string;
}

export interface DoctorDetails extends Doctor {
  address: string;
  phone: string;
  website?: string;
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: string;
  }[];
  documents: {
    id: string;
    type: string;
    url: string;
    verified: boolean;
  }[];
}

export async function getDoctors(filters?: {
  search?: string;
  specialty?: string;
  status?: string;
}) {
  let query = supabase
    .from('doctors')
    .select(`
      *,
      specialties (name),
      locations (city, state),
      reviews (rating)
    `);

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  if (filters?.specialty) {
    query = query.eq('specialty', filters.specialty);
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('verification_status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getDoctorById(id: string) {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      specialties (name),
      locations (city, state),
      documents (id, type, url, verified),
      education (institution, degree, year),
      certifications (name, issuer, year)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateDoctorVerification(id: string, status: 'verified' | 'rejected', notes?: string) {
  const { error } = await supabase
    .from('doctors')
    .update({
      verification_status: status,
      verification_notes: notes,
      verified_at: status === 'verified' ? new Date().toISOString() : null
    })
    .eq('id', id);

  if (error) throw error;

  // Create audit log
  await supabase
    .from('admin_audit_logs')
    .insert({
      action: `doctor_${status}`,
      entity_type: 'doctors',
      entity_id: id,
      changes: {
        status,
        notes
      }
    });
}