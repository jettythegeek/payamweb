export const PHONE_ERROR =
  "That doesn't look like a Nigerian mobile number. Try 0803 123 4567 or +234 803 123 4567."

export function normaliseNigerianPhone(value: string): string | null {
  const compact = value.replace(/[\s\-()]/g, '')
  const match = compact.match(/^(?:\+?234|0)?([789][01]\d{8})$/)
  return match ? `+234${match[1]}` : null
}

export const normalizeNigerianPhone = normaliseNigerianPhone

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 7) return value
  return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ••• ${digits.slice(-4)}`
}
