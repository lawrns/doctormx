import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readSource(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('doctor acquisition and pricing revenue pages', () => {
  const pricingPage = readSource('src/app/pricing/page.tsx')
  const paraMedicosPage = readSource('src/app/para-medicos/page.tsx')
  const forDoctorsPage = readSource('src/app/for-doctors/page.tsx')
  const combinedDoctorCopy = `${pricingPage}\n${paraMedicosPage}\n${forDoctorsPage}`

  it('keeps doctor signup pricing at $499 monthly and $5,000 yearly', () => {
    expect(combinedDoctorCopy).toContain('$499')
    expect(combinedDoctorCopy).toMatch(/\$5,?000/)
    expect(pricingPage).not.toMatch(/monthlyPrice:\s*(790|1490|2990)/)
    expect(combinedDoctorCopy).not.toMatch(/\$(790|1,490|2,990|999)/)
  })

  it('offers a high-ACV clinic or enterprise path with demo scheduling', () => {
    expect(combinedDoctorCopy).toMatch(/Clínicas|Enterprise/)
    expect(combinedDoctorCopy).toContain('Agendar demo')
  })

  it('contains ROI proof, Doctoralia comparison, trial, and trust copy without guaranteed-patient claims', () => {
    expect(combinedDoctorCopy).toContain('una consulta adicional')
    expect(combinedDoctorCopy).toContain('Doctoralia')
    expect(combinedDoctorCopy).toContain('14 días')
    expect(combinedDoctorCopy).toMatch(/seguridad|verificaci[oó]n|c[eé]dula|SEP/i)
    expect(combinedDoctorCopy).not.toMatch(/10 pacientes garantizados|6 meses gratis si no cumplimos|telemedicina #1/i)
  })
})
