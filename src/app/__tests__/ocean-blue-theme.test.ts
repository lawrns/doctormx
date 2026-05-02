import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const readSource = (relativePath: string) => readFileSync(join(root, relativePath), 'utf8')

describe('ocean blue brand system', () => {
  it('anchors the light theme to the historical ocean blue palette', () => {
    const globals = readSource('src/app/globals.css')

    expect(globals).toContain('--interactive: 227 75% 41%;')
    expect(globals).toContain('--interactive-hover: 227 75% 36%;')
    expect(globals).toContain('--interactive-soft: 222 100% 96%;')
    expect(globals).toContain('--brand-sky: 222 100% 69%;')
    expect(globals).toContain('--surface-tint: 222 100% 96%;')
    expect(globals).toContain('--public-surface-tint: 222 100% 96%;')
    expect(globals).toContain('--ring: 227 91% 59%;')
    expect(globals).toContain('--public-radius-card: 0.625rem;')
    expect(globals).toContain('--public-radius-control: 0.5rem;')
  })

  it('uses blue-tinted depth instead of flat generic SaaS shadows', () => {
    const globals = readSource('src/app/globals.css')

    expect(globals).toContain('--shadow-soft: 0 1px 2px rgba(15, 37, 95, 0.04), 0 12px 28px -22px rgba(15, 37, 95, 0.14);')
    expect(globals).toContain('--shadow-medium: 0 10px 24px -18px rgba(15, 37, 95, 0.16);')
    expect(globals).toContain('--shadow-strong: 0 18px 42px -24px rgba(15, 37, 95, 0.22);')
  })

  it('keeps Dr. Simeon brand accents ocean blue, not semantic green', () => {
    const drSimeon = readSource('src/components/ai-consulta/DrSimeonProtocolChat.tsx')

    expect(drSimeon).not.toContain('var(--trust)')
    expect(drSimeon).toContain('var(--brand-ocean)')
  })

  it('documents green as a state-only color in the design system', () => {
    const designSystem = readSource('src/app/design-system/page.tsx')

    expect(designSystem).toContain('Ocean blue is the brand')
    expect(designSystem).toContain('Green is reserved for completed, verified, or successful states')
    expect(designSystem).not.toContain('Green is not a brand color or success color')
    expect(designSystem).not.toContain('No Green')
  })
})
