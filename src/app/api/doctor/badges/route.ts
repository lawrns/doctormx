import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  getDoctorBadges, 
  updateDoctorBadges, 
  getPublicDoctorBadges,
  getBadgeCategories 
} from '@/lib/trust-badges'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const publicView = searchParams.get('public') === 'true'
    
    const supabase = await createClient()
    
    // If no doctorId provided, get current user's badges
    let targetDoctorId = doctorId
    if (!targetDoctorId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      targetDoctorId = user.id
    }
    
    if (publicView) {
      const result = await getPublicDoctorBadges(targetDoctorId)
      return NextResponse.json(result)
    }
    
    const badges = await getDoctorBadges(targetDoctorId)
    const categories = await getBadgeCategories()
    
    return NextResponse.json({
      badges,
      categories,
    })
  } catch (error) {
    console.error('Get badges error:', error)
    return NextResponse.json(
      { error: 'Error al obtener insignias' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Recalculate badges for the doctor
    const badges = await updateDoctorBadges(user.id)

    return NextResponse.json({
      success: true,
      badges,
      message: `Se calcularon ${badges.length} insignias`,
    })
  } catch (error) {
    console.error('Update badges error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar insignias' },
      { status: 500 }
    )
  }
}
