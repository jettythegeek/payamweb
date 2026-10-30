declare module 'canvas-confetti' {
  type Options = {
    particleCount?: number
    spread?: number
    startVelocity?: number
    origin?: { x?: number; y?: number }
    colors?: string[]
    disableForReducedMotion?: boolean
  }
  const confetti: (options?: Options) => Promise<null> | null
  export default confetti
}
