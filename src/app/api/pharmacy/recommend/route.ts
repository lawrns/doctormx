import { NextRequest, NextResponse } from 'next/server'
import { findSponsorPharmacies } from '@/lib/pharmacy'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, medications, location } = body

    if (!appointmentId || !medications || medications.length === 0) {
      return NextResponse.json(
        { error: 'Appointment ID and medications are required' },
        { status: 400 }
      )
    }

    const patientLocation = location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          state: location.state,
        }
      : null

    const recommendations = await findSponsorPharmacies(patientLocation, medications)

    return NextResponse.json({
      success: true,
      recommendations: recommendations.map((rec) => ({
        pharmacyId: rec.pharmacy.id,
        pharmacyName: rec.pharmacy.name,
        pharmacyAddress: rec.pharmacy.address,
        pharmacyCity: rec.pharmacy.city,
        distanceKm: rec.distanceKm,
        estimatedPrice: rec.estimatedPrice,
        savingsVsAverage: rec.savingsVsAverage,
        matchScore: rec.matchScore,
      })),
    })
  } catch (error) {
    logger.error('Error getting pharmacy recommendations:', { err: error })
    return NextResponse.json(
      { error: 'Failed to get pharmacy recommendations' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const patientId = searchParams.get('patientId')
    const medicationsParam = searchParams.get('medications')
    const city = searchParams.get('city')

    if (!appointmentId || !medicationsParam || !patientId) {
      return NextResponse.json(
        { error: 'Appointment ID, patient ID, and medications are required' },
        { status: 400 }
      )
    }

    const medications = medicationsParam.split(',').map((m) => m.trim())

    const patientLocation = city
      ? {
          latitude: 0,
          longitude: 0,
          city: city,
          state: '',
        }
      : null

    const recommendations = await findSponsorPharmacies(patientLocation, medications)

    return NextResponse.json({
      success: true,
      recommendations: recommendations.map((rec) => ({
        pharmacyId: rec.pharmacy.id,
        pharmacyName: rec.pharmacy.name,
        pharmacyAddress: rec.pharmacy.address,
        pharmacyCity: rec.pharmacy.city,
        distanceKm: rec.distanceKm,
        estimatedPrice: rec.estimatedPrice,
        savingsVsAverage: rec.savingsVsAverage,
        matchScore: rec.matchScore,
      })),
    })
  } catch (error) {
    logger.error('Error getting pharmacy recommendations:', { err: error })
    return NextResponse.json(
      { error: 'Failed to get pharmacy recommendations' },
      { status: 500 }
    )
  }
}
