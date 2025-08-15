'use client';

import { NavigationMenu } from '@/app/components/ui/NavigationMenu';
import { useTranslation } from '@/app/i18n/TranslationContext';

export default function SafetyPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavigationMenu mobileTitle={t('footer.safety')} />
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-4 text-white/90">
        <h1 className="text-2xl font-semibold">{t('footer.medicalDisclaimer')}</h1>
        <p>
          {t('footer.notMedicalDevice')} — {t('footer.educationOnly')}
        </p>
        <p className="text-white/70 text-sm">
          This app performs educational assessments and generates self‑management exercise plans. It does not provide a medical diagnosis, and it is not a substitute for professional clinical judgment. If you have red‑flag symptoms or concerns, seek medical care.
        </p>
        <h2 className="text-xl font-medium mt-6">When to seek care</h2>
        <ul className="list-disc pl-5 space-y-1 text-white/80 text-sm">
          <li>Fever or feeling unwell</li>
          <li>Recent trauma or accident</li>
          <li>Night pain that does not improve</li>
          <li>Numbness or weakness</li>
        </ul>
        <p className="text-white/60 text-xs mt-6">
          Reference: EU MDR software guidance for medical devices. This product is positioned outside MDR scope pending further review.
        </p>
      </div>
    </div>
  );
}



