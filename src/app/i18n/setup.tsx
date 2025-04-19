import React from 'react';
import { TranslationProvider } from './TranslationContext';
import { Locale } from './translations';

// Import language files to ensure they are loaded
import './translations/en';
import './translations/nb';

interface I18nWrapperProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

/**
 * Wrapper component that sets up internationalization
 * Add this to your layout.tsx or root component to enable translations
 */
export function I18nWrapper({ children, initialLocale }: I18nWrapperProps) {
  // If initialLocale is not provided, detection will happen in TranslationProvider
  return (
    <TranslationProvider initialLocale={initialLocale}>
      {children}
    </TranslationProvider>
  );
}

/**
 * Setup instructions:
 * 
 * 1. Wrap your application with I18nWrapper in your layout.tsx or root component:
 *    
 *    // In src/app/layout.tsx
 *    import { I18nWrapper } from '@/app/i18n/setup';
 *    
 *    export default function RootLayout({ children }: { children: React.ReactNode }) {
 *      return (
 *        <html lang="en">
 *          <body>
 *            <I18nWrapper>
 *              {children}
 *            </I18nWrapper>
 *          </body>
 *        </html>
 *      );
 *    }
 * 
 * 2. Use translations in your components:
 *    
 *    import { useTranslation } from '@/app/i18n';
 *    
 *    function MyComponent() {
 *      const { t, locale, setLocale } = useTranslation();
 *      
 *      return (
 *        <div>
 *          <p>{t('program.activity')}</p>
 *          <button onClick={() => setLocale('nb')}>Switch to Norwegian</button>
 *        </div>
 *      );
 *    }
 * 
 * 3. Add new translations directly to the language files in src/app/i18n/translations/
 */ 