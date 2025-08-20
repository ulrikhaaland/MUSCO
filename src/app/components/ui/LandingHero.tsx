'use client'

// PartnerLogos moved below the hero in page.tsx
import { useTranslation } from '@/app/i18n'
import { useEffect, useState } from 'react'
import LandingHeroImagesDesktop from './LandingHeroImagesDesktop'
import { logAnalyticsEvent } from '@/app/utils/analytics'

export type ViewerMode = 'full' | 'diagnose' | 'questionnaire'

export default function LandingHero({ onSelect }: { onSelect: (m: ViewerMode) => void }) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // parallax removed from this component (handled in LandingHeroImages)

  // analytics: hero surface view + cta impressions
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return
    const w = window.innerWidth
    const viewport: 'mobile' | 'tablet' | 'desktop' = w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile'
    const surfaces = 3
    logAnalyticsEvent('hero_surface_view', { surfaces, breakpoint: viewport })
    logAnalyticsEvent('cta_impression', { cta: 'diagnose', viewport })
    logAnalyticsEvent('cta_impression', { cta: 'workout', viewport })
  }, [isMounted])

  // images rendered by LandingHeroImages outside this component

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:[grid-template-columns:1fr_1.35fr] gap-8 items-start">
        {/* Copy */}
        <div className="order-2 md:order-1 text-left relative z-10">
          <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="mt-4 text-white/80 text-base md:text-lg">
            {t('landing.hero.subtitle')}
          </p>
          <div className="mt-4 md:mt-5 flex flex-col sm:flex-row gap-3">
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
          {/* Reviews link */}
          <div className="mt-4 text-gray-300 relative z-20">
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
          {/* Desktop images: first image sits to the right in the grid column, remaining wrap below */}
          <div className="hidden md:block mt-6 max-w-[560px]">
            <LandingHeroImagesDesktop variant="leftBelow" />
          </div>
        </div>
        {/* Media: fanned stack */}
        <div className="order-1 md:order-2">
          <LandingHeroImagesDesktop variant="rightStack" />
        </div>
      </div>
    </div>
  )
}
