'use client';

import Link from 'next/link';
import { useTranslation } from '@/app/i18n';

export default function RegulatoryFooter() {
  const { t } = useTranslation();
  // Hardcoded company details per request
  const orgNo = '913705696';
  const location = 'Oslo, Norway';

  return (
    <footer className="px-6 py-8 border-t border-white/10 text-gray-300">
      <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-3 items-start">
        <div className="space-y-1 text-sm">
          <div className="font-medium text-white/90">
            {t('footer.notMedicalDevice')}
          </div>
          <div className="text-white/70">
            {t('footer.educationOnly')}
          </div>
          <div className="text-xs text-white/60">
            <Link href="/safety" className="underline hover:text-white">
              {t('footer.medicalDisclaimer')}
            </Link>
          </div>
        </div>

        <nav className="flex flex-wrap gap-4 text-sm md:justify-center">
          <Link href="/privacy-policy" className="hover:text-white underline">
            {t('footer.privacyPolicy')}
          </Link>
          <Link href="/terms" className="hover:text-white underline">
            {t('footer.terms')}
          </Link>
          <Link href="/safety" className="hover:text-white underline">
            {t('footer.safety')}
          </Link>
        </nav>

        <div className="text-right md:text-right text-sm space-y-1">
          <div className="text-white/80">
            {t('footer.company.label')}
          </div>
          {orgNo && (
            <div className="text-white/70">
              {t('footer.company.org')}: {orgNo}
            </div>
          )}
          {location && (
            <div className="text-white/70">
              {t('footer.company.location')}: {location}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}


