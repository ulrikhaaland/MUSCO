'use client'

import PartnerLogos from '@/components/PartnerLogos'
import { useTranslation } from '@/app/i18n'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

export type ViewerMode = 'full' | 'diagnose' | 'questionnaire'

export default function LandingHero({ onSelect }: { onSelect: (m: ViewerMode) => void }) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const prefersReducedMotion = useMemo(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ), [])

  useEffect(() => {
    if (prefersReducedMotion) return
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const rx = ((e.clientX - rect.left) / rect.width - 0.5) * 8 // max 4px either dir
      const ry = ((e.clientY - rect.top) / rect.height - 0.5) * 8
      setOffset({ x: rx, y: ry })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [prefersReducedMotion])

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Copy */}
        <div className="order-2 md:order-1 text-left">
          <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="mt-4 text-white/80 text-base md:text-lg">
            {t('landing.hero.subtitle')}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onSelect('diagnose')}
              className="px-5 py-3 rounded-md bg-indigo-600 text-white text-base font-medium hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label={t('landing.hero.ctaPain')}
            >
              {t('landing.hero.ctaPain')}
            </button>
            <button
              onClick={() => onSelect('questionnaire')}
              className="px-5 py-3 rounded-md border border-white/20 text-white text-base font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label={t('landing.hero.ctaWorkout')}
            >
              {t('landing.hero.ctaWorkout')}
            </button>
          </div>
          {/* Trust row */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 text-gray-300">
            <div className="opacity-80 grayscale">
              <PartnerLogos />
            </div>
            <a
              href="https://g.page/r/GREPLACE"
              className="text-sm hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('landing.hero.reviewsAria')}
            >
              ★ 4.9 • 138 {t('landing.hero.reviews')}
            </a>
          </div>
        </div>
        {/* Media: fanned stack */}
        <div className="order-1 md:order-2">
          <div ref={containerRef} className="relative h-[320px] sm:h-[360px] md:h-[420px]">
            {/* Radial glow */}
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_50%,rgba(255,255,255,0.08)_0%,transparent_70%)]" />

            {/* Back surface: Select area */}
            <div
              className="absolute left-1/2 top-1/2 w-[78%] sm:w-[75%] md:w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden"
              style={{
                transform: `translate(calc(-50% + ${prefersReducedMotion ? 0 : offset.x * -0.3}px), calc(-50% + ${prefersReducedMotion ? 0 : offset.y * -0.3}px)) rotate(-10deg) scale(0.94)`
              }}
            >
              <Image
                src="/landingpage/images/hero-select.webp"
                alt={t('landing.hero.alt.select')}
                fill
                priority
                sizes="(max-width: 768px) 75vw, 40vw"
                className="object-cover"
              />
            </div>

            {/* Middle surface: Answer questions */}
            <div
              className="absolute left-1/2 top-1/2 w-[84%] sm:w-[80%] md:w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 shadow-[0_18px_50px_rgba(0,0,0,0.35)] overflow-hidden"
              style={{
                transform: `translate(calc(-50% + ${prefersReducedMotion ? 0 : offset.x * 0.2}px), calc(-50% + ${prefersReducedMotion ? 0 : offset.y * 0.2}px)) rotate(8deg) scale(0.97)`
              }}
            >
              <Image
                src="/landingpage/images/hero-chat.webp"
                alt={t('landing.hero.alt.chat')}
                fill
                priority
                sizes="(max-width: 768px) 80vw, 45vw"
                className="object-cover"
              />
            </div>

            {/* Front surface: Your plan */}
            <div
              className="absolute left-1/2 top-1/2 w-[90%] sm:w-[86%] md:w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 shadow-[0_16px_44px_rgba(0,0,0,0.35)] overflow-hidden"
              style={{
                transform: `translate(calc(-50% + ${prefersReducedMotion ? 0 : offset.x * 0.5}px), calc(-50% + ${prefersReducedMotion ? 0 : offset.y * 0.5}px)) rotate(-6deg) scale(1)`
              }}
            >
              <Image
                src="/landingpage/images/hero-plan.webp"
                alt={t('landing.hero.alt.plan')}
                fill
                priority
                sizes="(max-width: 768px) 86vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
