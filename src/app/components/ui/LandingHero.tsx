'use client'

import PartnerLogos from '@/components/PartnerLogos'
import { useTranslation } from '@/app/i18n'
import { useEffect, useMemo, useRef, useState } from 'react'
import { logAnalyticsEvent } from '@/app/utils/analytics'

export type ViewerMode = 'full' | 'diagnose' | 'questionnaire'

export default function LandingHero({ onSelect }: { onSelect: (m: ViewerMode) => void }) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [bp, setBp] = useState<'mobile'|'tablet'|'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    if (w >= 1024) return 'desktop'
    if (w >= 768) return 'tablet'
    return 'mobile'
  })
  const prefersReducedMotion = useMemo(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ), [])
  const isCoarsePointer = useMemo(() => (
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  ), [])

  const imgBase = bp === 'mobile' ? '/landingpage/mobile' : '/landingpage/desktop'
  const path = (name: string) => `${imgBase}/${name}.png`

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => {
      const w = window.innerWidth
      const next: 'mobile'|'tablet'|'desktop' = w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile'
      setBp(next)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // subtle parallax (disabled on reduced-motion and coarse pointers)
  useEffect(() => {
    if (prefersReducedMotion || isCoarsePointer) return
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const rx = ((e.clientX - rect.left) / rect.width - 0.5) * 4
      const ry = ((e.clientY - rect.top) / rect.height - 0.5) * 4
      setOffset({ x: rx, y: ry })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [prefersReducedMotion, isCoarsePointer])

  // analytics: hero surface view + cta impressions
  useEffect(() => {
    const surfaces = 3
    logAnalyticsEvent('hero_surface_view', { surfaces, breakpoint: bp })
    logAnalyticsEvent('cta_impression', { cta: 'diagnose', viewport: bp })
    logAnalyticsEvent('cta_impression', { cta: 'workout', viewport: bp })
  }, [bp])

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
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 text-gray-300 relative z-20">
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
          <div
            ref={containerRef}
            aria-label={t('landing.hero.ariaStack')}
            className="relative z-0 h-[380px] md:h-[420px] lg:h-[460px] pointer-events-none"
          >
            {/* Radial glow */}
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_50%,rgba(255,255,255,0.06)_0%,transparent_70%)]" />

            {/* Back surface: Select area */}
            <div
              className="absolute left-1/2 top-1/2 w-[70%] md:w-[68%] lg:w-[66%] aspect-video -translate-x-1/2 -translate-y-1/2 rounded-xl border overflow-hidden relative bg-[#141922] shadow-[0_18px_48px_rgba(0,0,0,0.34)]"
              style={{
                transform: `translate(calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.x * -0.3}px), calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.y * -0.3}px)) rotate(-10deg) scale(0.94)`,
                borderColor: 'rgba(255,255,255,0.12)'
              }}
            >
              <img
                src={path('select_area')}
                alt={t('landing.hero.alt.select')}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Middle surface: Answer questions */}
            <div
              className="absolute left-1/2 top-1/2 w-[78%] md:w-[74%] lg:w-[72%] aspect-video -translate-x-1/2 -translate-y-1/2 rounded-xl border overflow-hidden relative bg-[#141922] shadow-[0_16px_44px_rgba(0,0,0,0.34)]"
              style={{
                transform: `translate(calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.x * 0.2}px), calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.y * 0.2}px)) rotate(8deg) scale(0.97)`,
                borderColor: 'rgba(255,255,255,0.12)'
              }}
            >
              <img
                src={path('answer_questions')}
                alt={t('landing.hero.alt.chat')}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Front surface: Your plan */}
            <div
              className="absolute left-1/2 top-1/2 w-[86%] md:w-[80%] lg:w-[78%] aspect-video -translate-x-1/2 -translate-y-1/2 rounded-xl border overflow-hidden relative bg-[#141922] shadow-[0_12px_36px_rgba(0,0,0,0.32)]"
              style={{
                transform: `translate(calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.x * 0.5}px), calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.y * 0.5}px)) rotate(-6deg) scale(1)`,
                borderColor: 'rgba(255,255,255,0.14)'
              }}
            >
              <img
                src={path('your_plan')}
                alt={t('landing.hero.alt.plan')}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Mobile caption */}
            {/* no caption on mobile since we now mirror desktop visuals */}
          </div>
        </div>
      </div>
    </div>
  )
}
