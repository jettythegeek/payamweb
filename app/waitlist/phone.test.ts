import { describe, expect, it } from 'vitest'
import { maskPhone, normalizeNigerianPhone } from './phone'

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
