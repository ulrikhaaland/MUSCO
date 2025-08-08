'use client'

import PartnerLogos from '@/components/PartnerLogos'
import { useTranslation } from '@/app/i18n'

export type ViewerMode = 'full' | 'diagnose' | 'questionnaire'

export default function LandingHero({ onSelect }: { onSelect: (m: ViewerMode) => void }) {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Copy */}
        <div className="order-2 md:order-1 text-left">
          <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="mt-4 text-gray-300 text-base md:text-lg">
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
              className="px-5 py-3 rounded-md border border-white/70 text-white text-base font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
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
        {/* Media */}
        <div className="order-1 md:order-2">
          <div className="relative aspect-video rounded-xl border border-white/15 overflow-hidden">
            <video
              src="/videos/hero-shoulder-demo.mp4"
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="/img/logo.png"
            >
              <track kind="captions" />
            </video>
          </div>
        </div>
      </div>
    </div>
  )
}
