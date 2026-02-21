import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { logger } from '@/lib/observability/logger'
import {
  applyToBePharmacy,
  approvePharmacy,
  rejectPharmacy,
  getAllPharmacies,
} from '@/lib/pharmacy'

export async function GET(request: NextRequest) {
  try {
    await requireRole('admin')

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const pharmacies = await getAllPharmacies(status || undefined)

    return NextResponse.json({
      success: true,
      pharmacies: pharmacies.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.contact_email,
        city: p.city,
        state: p.state,
        status: p.status,
        appliedAt: p.applied_at,
        approvedAt: p.approved_at,
      })),
    })
  } catch (error) {
    logger.error('Error getting pharmacies:', { err: error })
    return NextResponse.json({ error: 'Failed to get pharmacies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole('admin')

    const body = await request.json()
    const { action, pharmacyId, ...pharmacyData } = body

    switch (action) {
      case 'approve': {
        if (!pharmacyId) {
          return NextResponse.json({ error: 'Pharmacy ID is required' }, { status: 400 })
        }
        const success = await approvePharmacy(pharmacyId, user.id)
        if (!success) {
          return NextResponse.json({ error: 'Failed to approve pharmacy' }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: 'Pharmacy approved' })
      }

      case 'reject': {
        if (!pharmacyId) {
          return NextResponse.json({ error: 'Pharmacy ID is required' }, { status: 400 })
        }
        const success = await rejectPharmacy(pharmacyId)
        if (!success) {
          return NextResponse.json({ error: 'Failed to reject pharmacy' }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: 'Pharmacy rejected' })
      }

      case 'apply': {
        const { name, email, phone, address, city, state } = pharmacyData
        if (!name || !email || !phone || !address || !city || !state) {
          return NextResponse.json(
            { error: 'All fields are required for application' },
            { status: 400 }
          )
        }
        const result = await applyToBePharmacy(name, email, phone, address, city, state)
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 })
        }
        return NextResponse.json({
          success: true,
          message: 'Application submitted successfully',
          pharmacyId: result.pharmacyId,
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Error processing pharmacy request:', { err: error })
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
