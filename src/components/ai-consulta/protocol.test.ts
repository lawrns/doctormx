import { describe, expect, it } from 'vitest'
import {
  createInitialProtocolState,
  seedChiefComplaintBeforeName,
} from '@/components/ai-consulta/protocol'

describe('Dr Simeon protocol urgent shortcut handling', () => {
  it('escalates breathing difficulty shortcuts before asking for a name', () => {
    const result = seedChiefComplaintBeforeName(createInitialProtocolState(), 'Me cuesta respirar')

    expect(result.state.step).toBe('emergency')
    expect(result.state.completed).toBe(true)
    expect(result.caseSummary.urgency).toBe('emergency')
    expect(result.caseSummary.chiefComplaint).toBe('Me cuesta respirar')
    expect(result.assistantMessage).toMatch(/llama al 911|urgencias ahora/i)
    expect(result.assistantMessage).not.toMatch(/primer nombre/i)
  })

  it('escalates chest pressure shortcuts before asking for a name', () => {
    const result = seedChiefComplaintBeforeName(createInitialProtocolState(), 'Siento presión en el pecho')

    expect(result.state.step).toBe('emergency')
    expect(result.caseSummary.urgency).toBe('emergency')
    expect(result.caseSummary.chiefComplaint).toBe('Siento presión en el pecho')
    expect(result.assistantMessage).toMatch(/llama al 911|urgencias ahora/i)
  })
})
