export type WaitlistCity = {
  slug: string
  name: string
  priority: boolean
}

export const WAITLIST_CITIES: readonly WaitlistCity[] = [
  { slug: 'umuahia', name: 'Umuahia', priority: true },
  { slug: 'aba', name: 'Aba', priority: true },
  { slug: 'owerri', name: 'Owerri', priority: true },
  { slug: 'port-harcourt', name: 'Port Harcourt', priority: true },
  { slug: 'awka', name: 'Awka', priority: true },
  { slug: 'onitsha', name: 'Onitsha', priority: true },
  { slug: 'enugu', name: 'Enugu', priority: true },
  { slug: 'abakaliki', name: 'Abakaliki', priority: true },
  { slug: 'uyo', name: 'Uyo', priority: true },
  { slug: 'lagos', name: 'Lagos', priority: false },
  { slug: 'abuja-fct', name: 'Abuja (FCT)', priority: false },
  { slug: 'benin-city', name: 'Benin City', priority: false },
  { slug: 'ilorin', name: 'Ilorin', priority: false },
  { slug: 'warri', name: 'Warri', priority: false },
  { slug: 'calabar', name: 'Calabar', priority: false },
  { slug: 'asaba', name: 'Asaba', priority: false },
] as const

export const CITIES = WAITLIST_CITIES

export const PRIORITY_CITIES = WAITLIST_CITIES.filter((city) => city.priority)

export function cityFromSlug(slug: string | null | undefined) {
  if (!slug) return undefined
  return WAITLIST_CITIES.find((city) => city.slug === slug.toLowerCase())
}

export function isWaitlistCityName(name: string) {
  return WAITLIST_CITIES.some((city) => city.name === name)
}
