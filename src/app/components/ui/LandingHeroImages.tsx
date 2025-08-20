'use client'

import { useTranslation } from '@/app/i18n'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

export default function LandingHeroImages({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const layerBackRef = useRef<HTMLDivElement | null>(null)
  const layerMidRef = useRef<HTMLDivElement | null>(null)
  const layerFrontRef = useRef<HTMLDivElement | null>(null)
  const groupRef = useRef<HTMLDivElement | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)
  const [groupShiftY, setGroupShiftY] = useState<number>(0)

  const prefersReducedMotion = useMemo(() => (
    isMounted && typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ), [isMounted])
  const isCoarsePointer = useMemo(() => (
    isMounted && typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  ), [isMounted])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Measure the union of transformed layers and set container height to fit all
  useLayoutEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const compute = () => {
      const rect = container.getBoundingClientRect()
      const layers = [layerBackRef.current, layerMidRef.current, layerFrontRef.current].filter(Boolean) as HTMLDivElement[]
      if (layers.length === 0) return
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      layers.forEach((el) => {
        const r = el.getBoundingClientRect()
        const topWithin = r.top - rect.top
        const bottomWithin = r.bottom - rect.top
        if (topWithin < minY) minY = topWithin
        if (bottomWithin > maxY) maxY = bottomWithin
      })
      const topDesired = 12 // px gap between title and first card
      const bottomFudgePx = 8
      const union = Math.ceil(maxY - minY)
      const needed = union + topDesired + bottomFudgePx
      if (Number.isFinite(needed) && needed > 0) setContainerHeight(needed)
      const shift = Math.max(0, topDesired - minY)
      setGroupShiftY(shift)
    }

    compute()
    const ro = new ResizeObserver(() => compute())
    ro.observe(container)
    window.addEventListener('resize', compute)
    const id = window.setTimeout(compute, 50)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
      window.clearTimeout(id)
    }
  }, [])

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

  return (
    <div className={className}>
      <h2 className="text-white text-2xl font-semibold mb-1 md:mb-3">{t('landing.how.title')}</h2>
      <div
        ref={containerRef}
        aria-label={t('landing.hero.ariaStack')}
        className="relative isolate z-0 h-auto md:min-h-[720px] lg:min-h-[780px] pointer-events-none overflow-hidden"
        style={containerHeight ? { height: `${containerHeight}px` } : undefined}
      >
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_50%,rgba(255,255,255,0.06)_0%,transparent_70%)]" />

        <div ref={groupRef} style={{ transform: `translateY(${groupShiftY}px)` }}>
        <div
          ref={layerBackRef}
          className="absolute left-1/2 top-16 md:top-[45%] w-[80%] md:w-[76%] lg:w-[74%] aspect-video -translate-x-1/2 -translate-y-0 md:-translate-y-1/2 rounded-xl border overflow-hidden relative bg-[#141922] shadow-[0_18px_48px_rgba(0,0,0,0.34)]"
          style={{
            transform: `translate(calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.x * -0.3}px), calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.y * -0.3}px)) rotate(-10deg) scale(0.94)`,
            borderColor: 'rgba(255,255,255,0.12)'
          }}
        >
          <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md bg-black/50 text-white text-sm md:text-base font-medium">
            {t('landing.how.label.findArea')}
          </div>
          <ResponsiveHeroImage name="select_area" alt={t('landing.hero.alt.select')} />
        </div>

        <div
          ref={layerMidRef}
          className="absolute left-1/2 top-28 md:top-[45%] w-[88%] md:w-[84%] lg:w-[82%] aspect-video -translate-x-1/2 -translate-y-0 md:-translate-y-1/2 rounded-xl border overflow-hidden relative bg-[#141922] shadow-[0_16px_44px_rgba(0,0,0,0.34)]"
          style={{
            transform: `translate(calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.x * 0.2}px), calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.y * 0.2}px)) rotate(8deg) scale(0.97)`,
            borderColor: 'rgba(255,255,255,0.12)'
          }}
        >
          <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md bg-black/50 text-white text-sm md:text-base font-medium">
            {t('landing.how.label.discuss')}
          </div>
          <ResponsiveHeroImage name="answer_questions" alt={t('landing.hero.alt.chat')} />
        </div>

        <div
          ref={layerFrontRef}
          className="absolute left-1/2 top-40 md:top-[45%] w-[96%] md:w-[90%] lg:w-[88%] aspect-video -translate-x-1/2 -translate-y-0 md:-translate-y-1/2 rounded-xl border overflow-hidden relative bg-[#141922] shadow-[0_12px_36px_rgba(0,0,0,0.32)]"
          style={{
            transform: `translate(calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.x * 0.5}px), calc(-50% + ${prefersReducedMotion || isCoarsePointer ? 0 : offset.y * 0.5}px)) rotate(-6deg) scale(1)`,
            borderColor: 'rgba(255,255,255,0.14)'
          }}
        >
          <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md bg-black/50 text-white text-sm md:text-base font-medium">
            {t('landing.how.label.execute')}
          </div>
          <ResponsiveHeroImage name="your_plan" alt={t('landing.hero.alt.plan')} />
        </div>
        </div>
      </div>
      <div className="mt-4 flex justify-start">
        <button
          onClick={() => window.location.assign('/app')}
          className="w-full sm:w-auto px-5 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
        >
          {t('landing.how.cta')}
        </button>
      </div>
    </div>
  )
}


