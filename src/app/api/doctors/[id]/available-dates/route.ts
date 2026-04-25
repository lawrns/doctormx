import { NextRequest, NextResponse } from 'next/server'
import { getDoctorAvailability, getOccupiedSlots, generateTimeSlots } from '@/lib/availability'
import { APPOINTMENT_CONFIG } from '@/config/constants'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Start and end date parameters required' },
      { status: 400 }
    )
  }

  try {
    // Get doctor's availability rules
    const availability = await getDoctorAvailability(id)
    
    // Generate dates in range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const datesWithSlots: string[] = []
    
    const current = new Date(start)
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]
      const dayOfWeek = current.getDay()
      
      // Check if doctor has availability for this day
      const dayAvailability = availability.filter((a: { day_of_week: number; start_time: string; end_time: string }) => a.day_of_week === dayOfWeek)
      
      if (dayAvailability.length > 0) {
        // Generate all possible slots for this day
        const allSlots = dayAvailability.flatMap((slot: { start_time: string; end_time: string }) =>
          generateTimeSlots(slot.start_time, slot.end_time)
        )
        
        // Get occupied slots
        const occupied = await getOccupiedSlots(id, dateStr)
        
        // Check if there are any available slots
        const availableSlots = allSlots.filter((slot: string) => 
          !occupied.some((o: { start: string }) => o.start === slot)
        )
        
        if (availableSlots.length > 0) {
          datesWithSlots.push(dateStr)
        }
      }
      
      current.setDate(current.getDate() + 1)
    }
    
    return NextResponse.json({ dates: datesWithSlots })
  } catch {
    return NextResponse.json(
      { error: 'Failed to get available dates' },
      { status: 500 }
    )
  }
}
