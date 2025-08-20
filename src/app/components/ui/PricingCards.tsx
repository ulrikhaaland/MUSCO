'use client'

import { useTranslation } from '@/app/i18n'

type Plan = 'monthly' | 'annual' | 'ulrik'

export default function PricingCards({
  onMonthly,
  onAnnual,
  onFounder,
  onTry,
  loading = null,
  showFounder = false,
  benefitsBg = 'bg-gray-800/60',
  benefitsRing = 'ring-1 ring-gray-700/50',
  cardBg = 'bg-gray-800/60',
  cardRing = 'ring-1 ring-gray-700/50',
  showFooterNote = false,
}: {
  onMonthly: () => void
  onAnnual: () => void
  onFounder?: () => void
  onTry?: () => void
  loading?: Plan | null
  showFounder?: boolean
  benefitsBg?: string
  benefitsRing?: string
  cardBg?: string
  cardRing?: string
  showFooterNote?: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="grid md:grid-cols-5 gap-6 items-stretch">
      {/* Benefits (left) */}
      <div className={`md:col-span-3 rounded-2xl ${benefitsRing} ${benefitsBg} p-5 text-gray-200 h-full`}>
        <h3 className="text-lg font-medium mb-3">{t('subscribe.premium.heading')}</h3>
        <ul className="space-y-3 text-gray-200">
          {[
            'subscribe.premium.benefit.weeklyFollowUp',
            'subscribe.premium.benefit.library',
            'subscribe.premium.benefit.evidence',
            'subscribe.premium.benefit.calendar',
            'subscribe.premium.benefit.multiLang',
            'subscribe.premium.benefit.priority',
          ].map((key) => (
            <li key={key} className="flex items-start gap-3 text-sm">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm mt-4 text-gray-400">{t('subscribe.free.limits')}</p>
      </div>

      {/* Price cards (right) */}
      <div className="md:col-span-2 flex flex-col gap-4 h-full">
        <div className={`rounded-2xl ${cardRing} ${cardBg} p-5 flex-1 flex`}>
          <div className="flex items-baseline justify-between w-full">
            <div>
              <div className="text-white text-sm">{t('subscribe.plan.monthly')}</div>
              <div className="text-gray-300">{t('subscribe.price.monthly')}</div>
            </div>
            <button
              onClick={onMonthly}
              disabled={loading !== null}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white"
            >
              {loading === 'monthly' ? t('subscribe.button.redirecting') : t('subscribe.button.choose')}
            </button>
          </div>
        </div>

        <div className={`rounded-2xl ${cardRing} ${cardBg} p-5 flex-1 flex`}>
          <div className="flex items-baseline justify-between w-full">
            <div>
              <div className="text-white text-sm">{t('subscribe.plan.annual')}</div>
              <div className="text-gray-300">{t('subscribe.price.annual')}</div>
            </div>
            <button
              onClick={onAnnual}
              disabled={loading !== null}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white"
            >
              {loading === 'annual' ? t('subscribe.button.redirecting') : t('subscribe.button.choose')}
            </button>
          </div>
        </div>

        {showFounder && (
          <div className={`rounded-2xl p-5 ${cardRing.replace('ring-gray-700/50','ring-amber-700/50')} bg-amber-900/50 flex-1 flex`}>
            <div className="flex items-baseline justify-between w-full">
              <div>
                <div className="text-white text-sm">{t('subscribe.plan.founder')}</div>
                <div className="text-gray-300">{t('subscribe.plan.founderDesc')}</div>
              </div>
              <button
                onClick={onFounder}
                disabled={loading !== null}
                className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white"
              >
                {loading === 'ulrik' ? t('subscribe.button.redirecting') : t('subscribe.button.choose')}
              </button>
            </div>
          </div>
        )}

        {onTry && (
          <div className={`rounded-2xl ${cardRing} ${cardBg} p-5 flex-1 flex`}>
            <div className="flex items-center justify-between w-full">
              <div className="text-white text-sm">{t('landing.pricing.tier.free')}</div>
              <button onClick={onTry} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white">
                {t('landing.pricing.try')}
              </button>
            </div>
          </div>
        )}

        {showFooterNote && (
          <div className="text-xs text-gray-500">{t('subscribe.footer.note')}</div>
        )}
      </div>
    </div>
  )
}


