'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/app/i18n'

type Variant = 'top' | 'row' | 'leftBelow' | 'rightStack'

export default function LandingHeroImagesDesktop({ variant, className = '' }: { variant: Variant; className?: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState<string | null>(null)

  const ResponsiveHeroImage = ({ name, alt }: { name: string; alt: string }) => (
    <picture>
      <source media="(min-width: 768px)" srcSet={`/landingpage/desktop/${name}.png`} />
      <img
        src={`/landingpage/mobile/${name}.png`}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
    </picture>
  )

  const cardBase = 'relative w-full max-w-[820px] lg:max-w-[960px] xl:max-w-[1100px] 2xl:max-w-[1240px] aspect-video rounded-xl border border-white/10 bg-[#141922] overflow-hidden transition-transform duration-300 transform-gpu hover:scale-[1.05] hover:z-10 cursor-zoom-in'
  const label = 'absolute top-2 left-2 z-10 px-2 py-1 rounded-md bg-black/50 text-white text-xs md:text-sm font-medium'

  // fullscreen overlay for image preview
  const Overlay = () => {
    if (!open) return null
    const srcDesktop = `/landingpage/desktop/${open}.png`
    const srcMobile = `/landingpage/mobile/${open}.png`
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
        onClick={() => setOpen(null)}
      >
        <picture onClick={(e) => e.stopPropagation()}>
          <source media="(min-width: 768px)" srcSet={srcDesktop} />
          <img src={srcMobile} alt="" className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" />
        </picture>
        <button
          onClick={() => setOpen(null)}
          className="absolute top-4 right-4 text-white/90 hover:text-white text-2xl"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    )
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if ((e.key === 'Enter' || e.key === ' ') && open) {
        e.preventDefault()
        setOpen(null)
      }
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (variant === 'top') {
    return (
      <div className={`hidden md:block ${className}`}>
        <div className="relative h-[600px] lg:h-[760px] xl:h-[880px] 2xl:h-[980px] overflow-visible">
          <div
            className={`${cardBase} shadow-[0_18px_48px_rgba(0,0,0,0.34)] rotate-[-4deg] absolute right-0 top-0`}
            onClick={() => setOpen('select_area')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setOpen('select_area')
            }}
          >
            <div className={label}>
              {t('landing.how.label.findArea')}
            </div>
            <ResponsiveHeroImage name="select_area" alt={t('landing.hero.alt.select')} />
          </div>
        </div>
        <Overlay />
      </div>
    )
  }

  if (variant === 'leftBelow') {
    return (
      <div className={`hidden md:block ${className}`}>
        <div
          className={`${cardBase} shadow-[0_16px_44px_rgba(0,0,0,0.34)] rotate-[3deg]`}
          onClick={() => setOpen('answer_questions')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setOpen('answer_questions')
          }}
        >
          <div className={label}>{t('landing.how.label.discuss')}</div>
          <ResponsiveHeroImage name="answer_questions" alt={t('landing.hero.alt.chat')} />
        </div>
        <Overlay />
      </div>
    )
  }

  if (variant === 'rightStack') {
    return (
      <div className={`hidden md:block ${className}`}>
        <div className="flex flex-col gap-4 items-end">
          <div
            className={`${cardBase} shadow-[0_18px_48px_rgba(0,0,0,0.34)] rotate-[-4deg]`}
            onClick={() => setOpen('select_area')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setOpen('select_area')
            }}
          >
            <div className={label}>{t('landing.how.label.findArea')}</div>
            <ResponsiveHeroImage name="select_area" alt={t('landing.hero.alt.select')} />
          </div>
          <div
            className={`${cardBase} shadow-[0_12px_36px_rgba(0,0,0,0.32)] rotate-[-2deg]`}
            onClick={() => setOpen('your_plan')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setOpen('your_plan')
            }}
          >
            <div className={label}>{t('landing.how.label.execute')}</div>
            <ResponsiveHeroImage name="your_plan" alt={t('landing.hero.alt.plan')} />
          </div>
        </div>
        <Overlay />
      </div>
    )
  }

  // row variant: two cards side-by-side (legacy - not used now but kept for flexibility)
  return (
    <div className={`hidden md:block ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        <div className={`${cardBase} shadow-[0_16px_44px_rgba(0,0,0,0.34)] rotate-[3deg]`}>
          <div className={label}>
            {t('landing.how.label.discuss')}
          </div>
          <ResponsiveHeroImage name="answer_questions" alt={t('landing.hero.alt.chat')} />
        </div>
        <div className={`${cardBase} shadow-[0_12px_36px_rgba(0,0,0,0.32)] rotate-[-2deg]`}>
          <div className={label}>
            {t('landing.how.label.execute')}
          </div>
          <ResponsiveHeroImage name="your_plan" alt={t('landing.hero.alt.plan')} />
        </div>
      </div>
    </div>
  )
}


