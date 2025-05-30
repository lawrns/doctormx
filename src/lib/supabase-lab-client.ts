// Re-export from the main supabase module to avoid duplicate instances
export { supabase, getSupabaseClient } from './supabase';
import type { Database } from './database.types';

// Helper function to get the current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

// Types for lab testing
export interface LabTest {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  instructions?: string;
  preparation_required: boolean;
  fast_required: boolean;
  fast_hours?: number;
  processing_time_hours: number;
  is_active: boolean;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LabTestRequest {
  id: string;
  patient_id: string;
  status: string;
  instructions?: string;
  special_requirements?: string;
  payment_status: string;
  total_amount?: number;
  created_at?: string;
  updated_at?: string;
  items?: {
    id: string;
    test_id: string;
    price_at_order: number;
    test?: LabTest;
  }[];
  appointments?: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    address: string;
    status: string;
  }[];
}

export interface LabAppointment {
  id: string;
  request_id: string;
  technician_id?: string;
  appointment_date: string;
  appointment_time: string;
  address: string;
  lat?: number;
  lng?: number;
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LabResult {
  id: string;
  request_id: string;
  test_id: string;
  result_data: any;
  is_abnormal: boolean;
  pdf_url?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  test?: LabTest;
}

export interface AvailabilitySlot {
  date: string;
  slots: string[];
  isWeekend?: boolean;
}