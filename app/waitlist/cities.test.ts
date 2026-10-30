import { describe, expect, it } from 'vitest'
import { cityFromSlug, PRIORITY_CITIES, WAITLIST_CITIES } from './cities'

describe('waitlist cities', () => {
  it('keeps the owner-priority cities first and in the specified order', () => {
    expect(PRIORITY_CITIES.map((city) => city.name)).toEqual([
      'Umuahia', 'Aba', 'Owerri', 'Port Harcourt', 'Awka', 'Onitsha', 'Enugu', 'Abakaliki', 'Uyo',
    ])
    expect(WAITLIST_CITIES.slice(0, PRIORITY_CITIES.length)).toEqual(PRIORITY_CITIES)
  })

  it('has unique names and slugs', () => {
    expect(new Set(WAITLIST_CITIES.map((city) => city.name)).size).toBe(WAITLIST_CITIES.length)
    expect(new Set(WAITLIST_CITIES.map((city) => city.slug)).size).toBe(WAITLIST_CITIES.length)
  })

  it('matches valid URL slugs and ignores unknown ones', () => {
    expect(cityFromSlug('aba')?.name).toBe('Aba')
    expect(cityFromSlug('not-a-city')).toBeUndefined()
  })
})
