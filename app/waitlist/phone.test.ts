import { describe, expect, it } from 'vitest'
import { limitNigerianPhoneInput, maskPhone, normalizeNigerianPhone } from './phone'

describe('normalizeNigerianPhone', () => {
  it.each([
    ['0803 123 4567', '+2348031234567'],
    ['8031234567', '+2348031234567'],
    ['2348031234567', '+2348031234567'],
    ['+234 (803) 123-4567', '+2348031234567'],
  ])('normalises %s', (input, expected) => {
    expect(normalizeNigerianPhone(input)).toBe(expected)
  })

  it.each(['', '123456', '+447911123456', '08231234567', '2346031234567'])('rejects %s', (input) => {
    expect(normalizeNigerianPhone(input)).toBeNull()
  })
})

describe('maskPhone', () => {
  it('keeps only the safe first and last digits visible', () => {
    expect(maskPhone('+2348031234567')).toBe('+234 803 ••• 4567')
  })
})

describe('limitNigerianPhoneInput', () => {
  it('allows eleven digits when the number begins with zero', () => {
    expect(limitNigerianPhoneInput('0803123456789')).toBe('08031234567')
  })

  it('allows ten digits without a leading zero', () => {
    expect(limitNigerianPhoneInput('803123456789')).toBe('8031234567')
  })

  it('preserves harmless formatting while limiting digits', () => {
    expect(limitNigerianPhoneInput('0803 123 4567 89')).toBe('0803 123 4567 ')
  })
})
