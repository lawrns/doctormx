// Service for Mobile Lab Testing (Exámenes a Domicilio)
import { 
  supabase, 
  LabTest, 
  LabTestRequest, 
  LabAppointment, 
  LabResult, 
  AvailabilitySlot, 
  getCurrentUser
} from '../lib/supabase-lab-client';

// Base path for API endpoints
const API_BASE_PATH = '/api/v1';

// Fetch list of available lab tests
// Fallback test catalog for development
const FALLBACK_TESTS: LabTest[] = [
  { id: '1', code: 'hemograma-completo', name: 'Hemograma Completo', description: 'Conteo de células sanguíneas', price: 120, instructions: 'Ayuno de 8 horas antes de la toma de muestra.', preparation_required: true, fast_required: true, fast_hours: 8, processing_time_hours: 24, is_active: true },
  { id: '2', code: 'quimica-sanguinea', name: 'Química Sanguínea', description: 'Perfil metabólico básico', price: 200, instructions: 'Ayuno de 8 horas antes de la toma de muestra.', preparation_required: true, fast_required: true, fast_hours: 8, processing_time_hours: 24, is_active: true },
  { id: '3', code: 'perfil-lipidico', name: 'Perfil Lipídico', description: 'Colesterol total y fracciones', price: 180, instructions: 'Ayuno de 12 horas antes de la toma de muestra.', preparation_required: true, fast_required: true, fast_hours: 12, processing_time_hours: 24, is_active: true },
  { id: '4', code: 'prueba-orina', name: 'Prueba de Orina', description: 'Análisis de orina completa', price: 100, instructions: 'Recolección en recipiente estéril proporcionado.', preparation_required: true, fast_required: false, fast_hours: 0, processing_time_hours: 24, is_active: true },
  { id: '5', code: 'covid', name: 'Prueba COVID-19 PCR', description: 'Detecta material genético del virus SARS-CoV-2', price: 290, instructions: 'No se requiere preparación especial.', preparation_required: false, fast_required: false, fast_hours: 0, processing_time_hours: 24, is_active: true }
];

// Fetch list of available lab tests
export async function fetchLabTests(): Promise<LabTest[]> {
  try {
    // First try from Supabase
    const { data, error } = await supabase
      .from('lab_tests')
      .select(`
        *,
        lab_test_category_mapping!inner(
          category_id,
          lab_test_categories!inner(
            name
          )
        )
      `)
      .eq('is_active', true);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map(test => ({
        ...test,
        category: test.lab_test_category_mapping[0]?.lab_test_categories?.name
      }));
    }
    
    // If no data from Supabase, try from API
    const res = await fetch(`${API_BASE_PATH}/lab-testing-tests`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const apiData = await res.json();
    return apiData;
  } catch (e) {
    console.warn('[LabTests] Using fallback test catalog:', e);
    return FALLBACK_TESTS;
  }
}

// Create a new lab request
export async function createLabRequest(
  tests: string[],
  instructions: string
): Promise<{ id: string }> {
  try {
    // Try to get the current authenticated user
    const user = await getCurrentUser();
    
    if (user) {
      // User is authenticated, create request in Supabase
      const { data, error } = await supabase
        .from('lab_test_requests')
        .insert({
          patient_id: user.id,
          status: 'pending',
          instructions,
          payment_status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create test items
      const testItems = tests.map(testId => ({
        request_id: data.id,
        test_id: testId,
        price_at_order: FALLBACK_TESTS.find(t => t.id === testId)?.price || 0
      }));
      
      const { error: itemsError } = await supabase
        .from('lab_test_request_items')
        .insert(testItems);
      
      if (itemsError) throw itemsError;
      
      // Calculate and update total amount
      const totalAmount = testItems.reduce((sum, item) => sum + item.price_at_order, 0);
      
      await supabase
        .from('lab_test_requests')
        .update({ total_amount: totalAmount })
        .eq('id', data.id);
      
      return { id: data.id };
    } else {
      // User is not authenticated, use API
      const res = await fetch(`${API_BASE_PATH}/lab-testing-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tests, instructions }),
      });
      
      if (!res.ok) {
        throw new Error(`Error creating lab request: ${res.status}`);
      }
      
      return res.json();
    }
  } catch (error) {
    console.error('Error creating lab request:', error);
    // For demo purposes without API or database
    return { id: `req_${Date.now()}` };
  }
}

// Fetch availability slots
// Generate fallback availability for development
function generateFallbackAvailability(): AvailabilitySlot[] {
  const today = new Date();
  const list: AvailabilitySlot[] = [];
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const iso = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Generate time slots between 8am and 6pm, every hour
    const timeSlots = [];
    
    // Weekend days have fewer slots
    if (isWeekend) {
      for (let hour = 9; hour <= 14; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    } else {
      for (let hour = 8; hour <= 18; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }
    
    list.push({ 
      date: iso, 
      slots: timeSlots,
      isWeekend
    });
  }
  
  return list;
}

// Fetch availability slots
export async function fetchAvailability(): Promise<AvailabilitySlot[]> {
  try {
    // First try from API
    const res = await fetch(`${API_BASE_PATH}/lab-testing-availability`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn('[Availability] Using fallback availability:', e);
    return generateFallbackAvailability();
  }
}

// Schedule an appointment for a lab request
export async function scheduleLabAppointment(
  date: string,
  time: string,
  address: string
): Promise<{ id: string }> {
  try {
    // Try to get the current authenticated user
    const user = await getCurrentUser();
    
    if (user) {
      // User is authenticated, try to find their most recent pending request
      const { data: requests, error: requestError } = await supabase
        .from('lab_test_requests')
        .select('id')
        .eq('patient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (requestError) throw requestError;
      
      // Create the appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('lab_appointments')
        .insert({
          request_id: requests.id,
          appointment_date: date,
          appointment_time: time,
          address,
          status: 'scheduled'
        })
        .select()
        .single();
      
      if (appointmentError) throw appointmentError;
      
      // Update the request status
      await supabase
        .from('lab_test_requests')
        .update({ status: 'scheduled' })
        .eq('id', requests.id);
      
      return { id: appointment.id };
    } else {
      // User is not authenticated, use API
      const res = await fetch(`${API_BASE_PATH}/lab-testing-requests`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, address }),
      });
      
      if (!res.ok) {
        throw new Error(`Error scheduling appointment: ${res.status}`);
      }
      
      return res.json();
    }
  } catch (error) {
    console.error('Error scheduling appointment:', error);
    // For demo purposes without API or database
    return { id: `appt_${Date.now()}` };
  }
}

// Fetch lab results for a request
export async function fetchLabResults(requestId: string): Promise<LabResult[]> {
  try {
    const { data, error } = await supabase
      .from('lab_results')
      .select(`
        *,
        test:lab_tests(*)
      `)
      .eq('request_id', requestId);
    
    if (error) throw error;
    
    return data;
  } catch (e) {
    console.warn('[LabResults] Could not fetch results:', e);
    
    // Mock data for demo
    if (requestId === 'demo123') {
      return [
        {
          id: 'res_1',
          request_id: requestId,
          test_id: '1',
          result_data: {
            value: '5.2',
            unit: 'millones/μL',
            referenceRange: '4.5 - 5.5',
            isAbnormal: false
          },
          is_abnormal: false,
          pdf_url: '#',
          created_at: new Date().toISOString(),
          test: FALLBACK_TESTS[0]
        },
        {
          id: 'res_2',
          request_id: requestId,
          test_id: '2',
          result_data: {
            value: '110',
            unit: 'mg/dL',
            referenceRange: '70 - 100',
            isAbnormal: true
          },
          is_abnormal: true,
          pdf_url: '#',
          created_at: new Date().toISOString(),
          test: FALLBACK_TESTS[1]
        }
      ];
    } else if (requestId === 'pending456') {
      // Processing results
      return [
        {
          id: 'res_4',
          request_id: requestId,
          test_id: '1',
          result_data: {},
          is_abnormal: false,
          created_at: new Date().toISOString(),
          test: FALLBACK_TESTS[0]
        },
        {
          id: 'res_5',
          request_id: requestId,
          test_id: '2',
          result_data: {},
          is_abnormal: false,
          created_at: new Date().toISOString(),
          test: FALLBACK_TESTS[1]
        }
      ];
    }
    
    return [];
  }
}

// Export interfaces
export type { LabTest, LabTestRequest, LabAppointment, LabResult, AvailabilitySlot };