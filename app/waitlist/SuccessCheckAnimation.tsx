'use client'

import { useEffect, useState } from 'react'
import { CircleCheckBig } from 'lucide-react'
import { Lottie } from 'lottie-react'
import animationData from './success-check.json'

export function SuccessCheckAnimation() {
  const [reduceMotion, setReduceMotion] = useState(false)
  useEffect(() => setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches), [])
  return <div className="wl-success-animation" aria-label="Signup confirmed" role="img">{reduceMotion ? <CircleCheckBig aria-hidden="true" /> : <Lottie src={animationData} autoplay loop={false} />}</div>
}
