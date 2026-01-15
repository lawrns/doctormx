import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { matchPharmacy, getPharmacySponsorById } from '@/lib/pharmacy'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { prescriptionId, appointmentId, location } = body

    if (!prescriptionId) {
      return NextResponse.json(
        { error: 'Prescription ID is required' },
        { status: 400 }
      )
    }

    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', prescriptionId)
      .single()

    if (prescriptionError || !prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    let patientLocation = location
    if (!patientLocation && appointmentId) {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('patient:profiles!appointments_patient_id_fkey(*)')
        .eq('id', appointmentId)
        .single()

      const patient = Array.isArray(appointment?.patient) ? appointment.patient[0] : appointment?.patient
      if (patient?.city) {
        patientLocation = {
          city: patient.city,
          neighborhood: patient.neighborhood || undefined,
        }
      }
    }

    const matches = await matchPharmacy(prescriptionId, patientLocation)

    const pharmacies = matches.map((match) => ({
      id: match.pharmacy.id,
      name: match.pharmacy.name,
      logo_url: match.pharmacy.logo_url,
      cover_image_url: match.pharmacy.cover_image_url,
      description: match.pharmacy.description,
      address: match.pharmacy.address,
      city: match.pharmacy.city,
      neighborhood: match.pharmacy.neighborhood,
      phone: match.pharmacy.phone,
      whatsapp_number: match.pharmacy.whatsapp_number,
      offers_delivery: match.pharmacy.offers_delivery,
      delivery_time_hours: match.pharmacy.delivery_time_hours,
      doctory_discount_code: match.pharmacy.doctory_discount_code,
      discount_percentage: match.pharmacy.discount_percentage,
      estimated_total: match.estimatedTotal,
      distance: match.distance,
      savings: match.savings,
      has_delivery: match.hasDelivery,
      delivery_time: match.deliveryTime,
      availability: match.availability,
    }))

    return NextResponse.json({
      success: true,
      pharmacies,
      count: pharmacies.length,
    })
  } catch (error) {
    console.error('Error getting pharmacy sponsors:', error)
    return NextResponse.json(
      { error: 'Failed to get pharmacy sponsors' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const pharmacyId = searchParams.get('pharmacyId')

    if (pharmacyId) {
      const pharmacy = await getPharmacySponsorById(pharmacyId)
      if (!pharmacy) {
        return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        pharmacy,
      })
    }

    const { data: pharmacies, error } = await supabase
      .from('pharmacy_sponsors')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch pharmacies' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pharmacies: pharmacies || [],
      count: pharmacies?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching pharmacies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pharmacies' },
      { status: 500 }
    )
  }
}
