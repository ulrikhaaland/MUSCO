'use client';

import { NavigationMenu } from '@/app/components/ui/NavigationMenu';
import { useTranslation } from '@/app/i18n/TranslationContext';

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavigationMenu mobileTitle={t('footer.terms')} />
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-4 text-white/90">
        <h1 className="text-2xl font-semibold">{t('footer.terms')}</h1>
        <p className="text-sm text-white/80">
          By using this service, you agree that the content is provided for educational purposes and does not constitute medical advice. You are responsible for your own safety and should stop any activity that causes worsening symptoms.
        </p>
        <p className="text-sm text-white/60">
          We may update these terms from time to time. Continued use constitutes acceptance of the updated terms.
        </p>
      </div>
    </div>
  );
}



