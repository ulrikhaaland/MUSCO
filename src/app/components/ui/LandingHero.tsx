'use client'

import { useTranslation } from '@/app/i18n'
import { useEffect, useState, type ReactNode } from 'react'
import { logAnalyticsEvent } from '@/app/utils/analytics'

export type ViewerMode = 'full' | 'diagnose' | 'questionnaire'

export default function LandingHero({ onSelect, children }: { onSelect: (m: ViewerMode) => void; children?: ReactNode }) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return
    const w = window.innerWidth
    const viewport: 'mobile' | 'tablet' | 'desktop' = w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile'
    logAnalyticsEvent('hero_surface_view', { breakpoint: viewport })
    logAnalyticsEvent('cta_impression', { cta: 'diagnose', viewport })
    logAnalyticsEvent('cta_impression', { cta: 'workout', viewport })
  }, [isMounted])

  return (
    <div className="w-full max-w-2xl animate-hero-fade-in">
      <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
        {t('landing.hero.title')}
      </h1>
      <p className="mt-4 text-white/80 text-base md:text-lg">
        {t('landing.hero.subtitle')}
      </p>
      <div className="mt-5 md:mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onSelect('diagnose')}
          className="px-6 py-3.5 rounded-lg bg-indigo-600 text-white text-base font-medium hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
          aria-label={t('landing.hero.ctaPain')}
        >
          {t('landing.hero.ctaPain')}
        </button>
        <button
          onClick={() => onSelect('questionnaire')}
          className="px-6 py-3.5 rounded-lg border border-white/20 text-white text-base font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          aria-label={t('landing.hero.ctaWorkout')}
        >
          {t('landing.hero.ctaWorkout')}
        </button>
      </div>
      {children}
    </div>
  )
}
