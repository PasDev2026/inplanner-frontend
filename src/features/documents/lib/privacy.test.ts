import { describe, expect, it } from 'vitest'
import { privacyLabel, privacyTone } from './privacy'

describe('document privacy labels', () => {
  it('maps all privacy levels', () => {
    expect(privacyLabel(0)).toBe('Público')
    expect(privacyLabel(1)).toBe('Solo mi área')
    expect(privacyLabel(2)).toBe('Solo mi sede')
    expect(privacyLabel(3)).toBe('Solo mencionados')
    expect(privacyLabel(4)).toBe('Privado')
  })

  it('falls back to Público for unknown levels', () => {
    expect(privacyLabel(99)).toBe('Público')
    expect(privacyTone(99)).toContain('doc-accent')
  })
})
