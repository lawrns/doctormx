import { describe, expect, it } from 'vitest'
import { isVideoAppointmentJoinable } from '@/lib/video/videoService'

function videoAppointment(overrides: Partial<Parameters<typeof isVideoAppointmentJoinable>[0]> = {}) {
  return {
    start_ts: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    appointment_type: 'video',
    video_status: 'ready',
    video_room_url: 'https://daily.test/apt-1',
    ...overrides,
  }
}

describe('video appointments', () => {
  it('does not allow joining a ready video appointment before the access window', () => {
    expect(isVideoAppointmentJoinable(videoAppointment())).toBe(false)
  })

  it('allows joining within 15 minutes of the appointment', () => {
    expect(
      isVideoAppointmentJoinable(
        videoAppointment({
          start_ts: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        })
      )
    ).toBe(true)
  })

  it('does not allow joining non-video appointments', () => {
    expect(
      isVideoAppointmentJoinable(
        videoAppointment({
          appointment_type: 'in_person',
        })
      )
    ).toBe(false)
  })
})
