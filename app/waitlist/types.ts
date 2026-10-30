export const WAITLIST_ROLES = ['use', 'sell', 'serve', 'drive'] as const
export type WaitlistRole = (typeof WAITLIST_ROLES)[number]
export type WaitlistVariant = 'hero' | 'final' | 'compact' | 'footer'

export type JoinResponse =
  | { status: 'joined'; referral_code: string; referrals_count: number; city: string }
  | { status: 'already_joined' }
  | { error: string }
