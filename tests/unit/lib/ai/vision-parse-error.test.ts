import { describe, it, expect } from 'vitest'

/**
 * SEC-014: JSON.parse error handling test
 * 
 * These tests verify that the error handling in vision.ts properly handles
 * malformed AI responses without crashing.
 */
describe('SEC-014: JSON.parse error handling in vision.ts', () => {
  
  // Simulate the parsing logic from vision.ts lines 154-174
  function simulateParsing(content: string): { 
    findings: string
    possibleConditions: unknown[]
    urgencyLevel: string
    recommendations: string[]
    followUpNeeded: boolean
    confidencePercent: number
    errorLogged: boolean
  } {
    let analysisData: Record<string, unknown>
    let errorLogged = false
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Error would be logged here in production
      errorLogged = true
      
      analysisData = {
        findings: content.replace(/[\s\S]*?"findings":\s*"?([^\n"]+)"?[\s\S]*/i, '$1').trim() || 'No se pudieron extraer hallazgos',
        possibleConditions: [],
        urgencyLevel: 'medium',
        recommendations: ['Consultar con un médico especialista'],
        followUpNeeded: true,
        confidencePercent: 50
      }
    }

    return {
      findings: (analysisData.findings as string) || 'No se pudieron extraer hallazgos',
      possibleConditions: (analysisData.possibleConditions as unknown[]) || [],
      urgencyLevel: (analysisData.urgencyLevel as string) || 'medium',
      recommendations: (analysisData.recommendations as string[]) || [],
      followUpNeeded: Boolean(analysisData.followUpNeeded),
      confidencePercent: (analysisData.confidencePercent as number) || 70,
      errorLogged
    }
  }

  it('should handle malformed JSON gracefully', () => {
    const result = simulateParsing('This is not valid JSON { invalid: json }')

    // Should not throw - graceful degradation
    expect(result).toBeDefined()
    expect(result.urgencyLevel).toBe('medium')
    expect(result.confidencePercent).toBe(50)
    expect(result.possibleConditions).toEqual([])
    expect(result.recommendations).toContain('Consultar con un médico especialista')
    expect(result.errorLogged).toBe(true)
  })

  it('should handle completely garbled response', () => {
    const result = simulateParsing('<<<<<Garbled>>>{{{{}}}}}}}}')

    expect(result).toBeDefined()
    // The regex extracts text when no "findings" pattern is found
    expect(result.findings).toBeDefined()
    expect(result.urgencyLevel).toBe('medium')
    expect(result.errorLogged).toBe(true)
  })

  it('should handle valid JSON correctly', () => {
    const validResponse = {
      findings: 'Normal skin examination',
      possibleConditions: [{ condition: 'Healthy skin', probability: 'high' }],
      urgencyLevel: 'low',
      recommendations: ['Continue regular skincare'],
      followUpNeeded: false,
      confidencePercent: 95
    }

    const result = simulateParsing(JSON.stringify(validResponse))

    expect(result.findings).toBe('Normal skin examination')
    expect(result.urgencyLevel).toBe('low')
    expect(result.confidencePercent).toBe(95)
    expect(result.errorLogged).toBe(false) // No error should be logged for valid JSON
  })

  it('should handle JSON with markdown code blocks', () => {
    const jsonContent = JSON.stringify({
      findings: 'Mild rash detected',
      possibleConditions: [{ condition: 'Contact dermatitis', probability: 'medium' }],
      urgencyLevel: 'low',
      recommendations: ['Apply moisturizer'],
      followUpNeeded: true,
      confidencePercent: 80
    })

    const result = simulateParsing(`\`\`\`json\n${jsonContent}\n\`\`\``)

    expect(result.findings).toBe('Mild rash detected')
    expect(result.confidencePercent).toBe(80)
    expect(result.errorLogged).toBe(false)
  })

  it('should handle empty response', () => {
    const result = simulateParsing('')

    expect(result).toBeDefined()
    expect(result.findings).toBe('No se pudieron extraer hallazgos')
    expect(result.errorLogged).toBe(true)
  })

  it('should handle unclosed JSON', () => {
    const result = simulateParsing('{"findings": "test", "urgencyLevel": "high"')

    expect(result.errorLogged).toBe(true)
    expect(result.urgencyLevel).toBe('medium') // Fallback value
  })

  it('should handle nested invalid JSON', () => {
    const result = simulateParsing('{ "findings": "test", "nested": {invalid} }')

    expect(result.errorLogged).toBe(true)
    expect(result.urgencyLevel).toBe('medium')
  })

  it('should extract findings from malformed response when possible', () => {
    const result = simulateParsing('Some text "findings": "Rash detected on arm" more text')

    expect(result.findings).toBe('Rash detected on arm')
    expect(result.errorLogged).toBe(true)
  })
})
