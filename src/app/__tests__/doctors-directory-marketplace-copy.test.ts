import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourcePath = join(process.cwd(), 'src/app/doctors/DoctorsDirectoryClient.tsx')
const source = readFileSync(sourcePath, 'utf8')

describe('DoctorsDirectoryClient marketplace conversion copy', () => {
  it('does not render fake demo doctors as marketplace supply', () => {
    expect(source).not.toContain('const demoDoctors')
    expect(source).not.toContain('Paula Ramirez')
    expect(source).not.toContain('Rodrigo Vazquez')
    expect(source).not.toContain('doctor.demo ?')
    expect(source).not.toContain("doctor.demo ? '/ai-consulta'")
  })

  it('uses booking-first CTA for real doctors and demand capture when supply is empty', () => {
    expect(source).toContain('Agendar cita')
    expect(source).toContain('Ver horarios reales al agendar')
    expect(source).toContain("'/contact?intent=patient-waitlist'")
    expect(source).toContain('Únete a la lista de espera')
  })

  it('marks unsupported convenience filters as upcoming instead of pretending they work', () => {
    expect(source).toContain('Disponible hoy')
    expect(source).toContain('Pago online')
    expect(source).toContain('Acepta seguro')
    expect(source).toContain('próximamente')
    expect(source).toContain('Estos filtros son informativos')
  })
})
