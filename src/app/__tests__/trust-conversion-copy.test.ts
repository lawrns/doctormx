import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const readSource = (relativePath: string) => readFileSync(join(root, relativePath), 'utf8')

describe('public trust and conversion UI copy', () => {
  it('clarifies AI intake scope, timing, privacy, and quota copy', () => {
    const aiConsultaSource = readSource('src/components/ai-consulta/DrSimeonProtocolChat.tsx')

    expect(aiConsultaSource).toContain('asistente de orientación clínica inicial')
    expect(aiConsultaSource).toContain('2 minutos')
    expect(aiConsultaSource).toMatch(/privad|confidencial/i)
    expect(aiConsultaSource).not.toContain('999 restantes')
    expect(aiConsultaSource).not.toMatch(/\{quota\.remaining\}\s*restantes/)
  })

  it('adds registration consent, verification, price, and protected data reassurance', () => {
    const registerSource = readSource('src/app/auth/register/page.tsx')

    expect(registerSource).toContain('Al continuar aceptas')
    expect(registerSource).toContain('href="/terms"')
    expect(registerSource).toContain('href="/privacy"')
    expect(registerSource).toMatch(/cédula.*verific/i)
    expect(registerSource).toMatch(/sin tarjeta|precio/i)
    expect(registerSource).toMatch(/datos protegidos|protegemos tus datos|datos.*proteg/i)
  })
})
