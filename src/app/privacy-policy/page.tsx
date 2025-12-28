'use client';

import { useState } from 'react';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';
import { useTranslation } from '@/app/i18n/TranslationContext';

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ id, title, icon, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="border-b border-gray-700/50 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors rounded-lg px-3 -mx-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-indigo-400">{icon}</span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[5000px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-w-none pl-9 pr-3 text-gray-300 text-sm space-y-3 [&_p]:text-gray-300 [&_h4]:text-white [&_h4]:font-medium [&_h4]:mt-4 [&_h4]:mb-2 [&_ul]:space-y-1 [&_ul]:my-2 [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:before:content-['•'] [&_li]:before:text-indigo-400 [&_li]:before:font-bold [&_strong]:text-gray-200">{children}</div>
      </div>
    </div>
  );
}

// Icons as SVG components
const icons = {
  intro: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  controller: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  data: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  health: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  thirdParty: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  ai: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  usage: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  legal: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  retention: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  sharing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  transfer: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  rights: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  security: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  children: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  cookies: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  changes: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  contact: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  complaint: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  const tableOfContents = [
    { id: 'introduction', title: t('privacyPolicy.section1.title') },
    { id: 'data-controller', title: t('privacyPolicy.section2.title') },
    { id: 'data-collected', title: t('privacyPolicy.section3.title') },
    { id: 'health-data', title: t('privacyPolicy.section4.title') },
    { id: 'third-party', title: t('privacyPolicy.section5.title') },
    { id: 'ai-processing', title: t('privacyPolicy.section6.title') },
    { id: 'how-we-use', title: t('privacyPolicy.section7.title') },
    { id: 'legal-basis', title: t('privacyPolicy.section8.title') },
    { id: 'data-retention', title: t('privacyPolicy.section9.title') },
    { id: 'data-sharing', title: t('privacyPolicy.section10.title') },
    { id: 'data-transfers', title: t('privacyPolicy.section11.title') },
    { id: 'your-rights', title: t('privacyPolicy.section12.title') },
    { id: 'security', title: t('privacyPolicy.section13.title') },
    { id: 'cookies', title: t('privacyPolicy.section14.title') },
    { id: 'children', title: t('privacyPolicy.section15.title') },
    { id: 'changes', title: t('privacyPolicy.section16.title') },
    { id: 'contact', title: t('privacyPolicy.section17.title') },
    { id: 'complaints', title: t('privacyPolicy.section18.title') },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Account for fixed navigation header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-gray-900 flex flex-col min-h-screen">
      <NavigationMenu mobileTitle={t('privacyPolicy.pageTitle')} />

      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-8">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-indigo-500/20 p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{t('privacyPolicy.header.title')}</h2>
                <p className="text-gray-400">{t('privacyPolicy.header.subtitle')}</p>
              </div>
              <div className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-medium ring-1 ring-indigo-500/30">
                {t('privacyPolicy.header.lastUpdated')}
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              {t('privacyPolicy.toc.title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tableOfContents.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-gray-400 hover:text-indigo-400 transition-colors text-sm py-1"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 p-6">
            <Section id="introduction" title={t('privacyPolicy.section1.title')} icon={icons.intro} defaultOpen={true}>
              <p>{t('privacyPolicy.section1.p1')}</p>
              <p>{t('privacyPolicy.section1.p2')}</p>
              <p>{t('privacyPolicy.section1.p3')}</p>
            </Section>

            <Section id="data-controller" title={t('privacyPolicy.section2.title')} icon={icons.controller}>
              <p>{t('privacyPolicy.section2.p1')}</p>
              <div className="bg-gray-900/50 rounded-lg p-4 mt-3">
                <p className="text-gray-300 mb-2"><strong>{t('privacyPolicy.section2.contactLabel')}</strong></p>
                <p className="text-gray-400">
                  {t('privacyPolicy.section2.email')} <a href="mailto:privacy@bodai.no" className="text-indigo-400 hover:underline">privacy@bodai.no</a>
                </p>
              </div>
            </Section>

            <Section id="data-collected" title={t('privacyPolicy.section3.title')} icon={icons.data}>
              <p>{t('privacyPolicy.section3.intro')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section3.account.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section3.account.item1')}</li>
                <li>{t('privacyPolicy.section3.account.item2')}</li>
                <li>{t('privacyPolicy.section3.account.item3')}</li>
                <li>{t('privacyPolicy.section3.account.item4')}</li>
                <li>{t('privacyPolicy.section3.account.item5')}</li>
                <li>{t('privacyPolicy.section3.account.item6')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section3.physical.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section3.physical.item1')}</li>
                <li>{t('privacyPolicy.section3.physical.item2')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section3.exercise.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section3.exercise.item1')}</li>
                <li>{t('privacyPolicy.section3.exercise.item2')}</li>
                <li>{t('privacyPolicy.section3.exercise.item3')}</li>
                <li>{t('privacyPolicy.section3.exercise.item4')}</li>
                <li>{t('privacyPolicy.section3.exercise.item5')}</li>
                <li>{t('privacyPolicy.section3.exercise.item6')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section3.ai.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section3.ai.item1')}</li>
                <li>{t('privacyPolicy.section3.ai.item2')}</li>
                <li>{t('privacyPolicy.section3.ai.item3')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section3.generated.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section3.generated.item1')}</li>
                <li>{t('privacyPolicy.section3.generated.item2')}</li>
                <li>{t('privacyPolicy.section3.generated.item3')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section3.payment.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section3.payment.item1')}</li>
                <li>{t('privacyPolicy.section3.payment.item2')}</li>
                <li>{t('privacyPolicy.section3.payment.item3')}</li>
              </ul>
              <p className="text-gray-400 text-sm mt-2">{t('privacyPolicy.section3.payment.note')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section3.technical.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section3.technical.item1')}</li>
                <li>{t('privacyPolicy.section3.technical.item2')}</li>
                <li>{t('privacyPolicy.section3.technical.item3')}</li>
                <li>{t('privacyPolicy.section3.technical.item4')}</li>
              </ul>
            </Section>

            <Section id="health-data" title={t('privacyPolicy.section4.title')} icon={icons.health}>
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-red-300 font-medium">{t('privacyPolicy.section4.warning')}</p>
              </div>

              <p>{t('privacyPolicy.section4.intro')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section4.medical.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section4.medical.item1')}</li>
                <li>{t('privacyPolicy.section4.medical.item2')}</li>
                <li>{t('privacyPolicy.section4.medical.item3')}</li>
                <li>{t('privacyPolicy.section4.medical.item4')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section4.physical.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section4.physical.item1')}</li>
                <li>{t('privacyPolicy.section4.physical.item2')}</li>
                <li>{t('privacyPolicy.section4.physical.item3')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section4.why.title')}</h4>
              <p>{t('privacyPolicy.section4.why.intro')}</p>
              <ul>
                <li>{t('privacyPolicy.section4.why.item1')}</li>
                <li>{t('privacyPolicy.section4.why.item2')}</li>
                <li>{t('privacyPolicy.section4.why.item3')}</li>
                <li>{t('privacyPolicy.section4.why.item4')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section4.consent.title')}</h4>
              <p>{t('privacyPolicy.section4.consent.p1')}</p>
            </Section>

            <Section id="third-party" title={t('privacyPolicy.section5.title')} icon={icons.thirdParty}>
              <p>{t('privacyPolicy.section5.intro')}</p>

              <div className="space-y-4 mt-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium flex items-center gap-2 mb-2">
                    <span className="text-orange-400">●</span> {t('privacyPolicy.section5.firebase.name')}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">{t('privacyPolicy.section5.firebase.purpose')}</p>
                  <ul className="text-gray-400 text-sm">
                    <li>{t('privacyPolicy.section5.firebase.item1')}</li>
                    <li>{t('privacyPolicy.section5.firebase.item2')}</li>
                    <li>{t('privacyPolicy.section5.firebase.item3')}</li>
                    <li>{t('privacyPolicy.section5.firebase.item4')}</li>
                    <li>{t('privacyPolicy.section5.firebase.item5')}</li>
                  </ul>
                  <p className="text-gray-500 text-xs mt-2">
                    {t('privacyPolicy.section5.firebase.privacy')} <a href="https://policies.google.com/privacy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium flex items-center gap-2 mb-2">
                    <span className="text-green-400">●</span> {t('privacyPolicy.section5.openai.name')}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">{t('privacyPolicy.section5.openai.purpose')}</p>
                  <ul className="text-gray-400 text-sm">
                    <li>{t('privacyPolicy.section5.openai.item1')}</li>
                    <li>{t('privacyPolicy.section5.openai.item2')}</li>
                    <li>{t('privacyPolicy.section5.openai.item3')}</li>
                  </ul>
                  <p className="text-gray-500 text-xs mt-2">
                    {t('privacyPolicy.section5.firebase.privacy')} <a href="https://openai.com/privacy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">openai.com/privacy</a>
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium flex items-center gap-2 mb-2">
                    <span className="text-purple-400">●</span> {t('privacyPolicy.section5.stripe.name')}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">{t('privacyPolicy.section5.stripe.purpose')}</p>
                  <ul className="text-gray-400 text-sm">
                    <li>{t('privacyPolicy.section5.stripe.item1')}</li>
                    <li>{t('privacyPolicy.section5.stripe.item2')}</li>
                    <li>{t('privacyPolicy.section5.stripe.item3')}</li>
                  </ul>
                  <p className="text-gray-500 text-xs mt-2">
                    {t('privacyPolicy.section5.firebase.privacy')} <a href="https://stripe.com/privacy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium flex items-center gap-2 mb-2">
                    <span className="text-blue-400">●</span> {t('privacyPolicy.section5.resend.name')}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">{t('privacyPolicy.section5.resend.purpose')}</p>
                  <ul className="text-gray-400 text-sm">
                    <li>{t('privacyPolicy.section5.resend.item1')}</li>
                    <li>{t('privacyPolicy.section5.resend.item2')}</li>
                  </ul>
                  <p className="text-gray-500 text-xs mt-2">
                    {t('privacyPolicy.section5.firebase.privacy')} <a href="https://resend.com/legal/privacy-policy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">resend.com/legal/privacy-policy</a>
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium flex items-center gap-2 mb-2">
                    <span className="text-red-400">●</span> {t('privacyPolicy.section5.youtube.name')}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">{t('privacyPolicy.section5.youtube.purpose')}</p>
                  <ul className="text-gray-400 text-sm">
                    <li>{t('privacyPolicy.section5.youtube.item1')}</li>
                    <li>{t('privacyPolicy.section5.youtube.item2')}</li>
                  </ul>
                  <p className="text-gray-500 text-xs mt-2">
                    {t('privacyPolicy.section5.firebase.privacy')} <a href="https://policies.google.com/privacy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>
                  </p>
                </div>
              </div>
            </Section>

            <Section id="ai-processing" title={t('privacyPolicy.section6.title')} icon={icons.ai}>
              <p>{t('privacyPolicy.section6.intro')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section6.how.title')}</h4>
              <ul>
                <li><strong>{t('privacyPolicy.section6.how.item1.label')}</strong> {t('privacyPolicy.section6.how.item1.text')}</li>
                <li><strong>{t('privacyPolicy.section6.how.item2.label')}</strong> {t('privacyPolicy.section6.how.item2.text')}</li>
                <li><strong>{t('privacyPolicy.section6.how.item3.label')}</strong> {t('privacyPolicy.section6.how.item3.text')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section6.automated.title')}</h4>
              <p>{t('privacyPolicy.section6.automated.p1')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section6.oversight.title')}</h4>
              <p>{t('privacyPolicy.section6.oversight.p1')}</p>

              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mt-4">
                <p className="text-amber-300 text-sm"><strong>{t('privacyPolicy.section6.disclaimer')}</strong></p>
              </div>
            </Section>

            <Section id="how-we-use" title={t('privacyPolicy.section7.title')} icon={icons.usage}>
              <p>{t('privacyPolicy.section7.intro')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section7.service.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section7.service.item1')}</li>
                <li>{t('privacyPolicy.section7.service.item2')}</li>
                <li>{t('privacyPolicy.section7.service.item3')}</li>
                <li>{t('privacyPolicy.section7.service.item4')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section7.personalization.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section7.personalization.item1')}</li>
                <li>{t('privacyPolicy.section7.personalization.item2')}</li>
                <li>{t('privacyPolicy.section7.personalization.item3')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section7.communication.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section7.communication.item1')}</li>
                <li>{t('privacyPolicy.section7.communication.item2')}</li>
                <li>{t('privacyPolicy.section7.communication.item3')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section7.improvement.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section7.improvement.item1')}</li>
                <li>{t('privacyPolicy.section7.improvement.item2')}</li>
                <li>{t('privacyPolicy.section7.improvement.item3')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section7.legal.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section7.legal.item1')}</li>
                <li>{t('privacyPolicy.section7.legal.item2')}</li>
                <li>{t('privacyPolicy.section7.legal.item3')}</li>
              </ul>
            </Section>

            <Section id="legal-basis" title={t('privacyPolicy.section8.title')} icon={icons.legal}>
              <p>{t('privacyPolicy.section8.intro')}</p>

              <div className="space-y-3 mt-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-1">{t('privacyPolicy.section8.consent.title')}</h4>
                  <p className="text-gray-400 text-sm">{t('privacyPolicy.section8.consent.text')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-1">{t('privacyPolicy.section8.contract.title')}</h4>
                  <p className="text-gray-400 text-sm">{t('privacyPolicy.section8.contract.text')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-1">{t('privacyPolicy.section8.legitimate.title')}</h4>
                  <p className="text-gray-400 text-sm">{t('privacyPolicy.section8.legitimate.text')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-1">{t('privacyPolicy.section8.legal.title')}</h4>
                  <p className="text-gray-400 text-sm">{t('privacyPolicy.section8.legal.text')}</p>
                </div>
              </div>
            </Section>

            <Section id="data-retention" title={t('privacyPolicy.section9.title')} icon={icons.retention}>
              <p>{t('privacyPolicy.section9.intro')}</p>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-300 font-medium">{t('privacyPolicy.section9.table.header.type')}</th>
                      <th className="text-left py-2 text-gray-300 font-medium">{t('privacyPolicy.section9.table.header.period')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-400">
                    <tr className="border-b border-gray-800">
                      <td className="py-2">{t('privacyPolicy.section9.table.account')}</td>
                      <td className="py-2">{t('privacyPolicy.section9.table.accountPeriod')}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2">{t('privacyPolicy.section9.table.health')}</td>
                      <td className="py-2">{t('privacyPolicy.section9.table.healthPeriod')}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2">{t('privacyPolicy.section9.table.programs')}</td>
                      <td className="py-2">{t('privacyPolicy.section9.table.programsPeriod')}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2">{t('privacyPolicy.section9.table.chat')}</td>
                      <td className="py-2">{t('privacyPolicy.section9.table.chatPeriod')}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2">{t('privacyPolicy.section9.table.payment')}</td>
                      <td className="py-2">{t('privacyPolicy.section9.table.paymentPeriod')}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2">{t('privacyPolicy.section9.table.analytics')}</td>
                      <td className="py-2">{t('privacyPolicy.section9.table.analyticsPeriod')}</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-2">{t('privacyPolicy.section9.table.auth')}</td>
                      <td className="py-2">{t('privacyPolicy.section9.table.authPeriod')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4">{t('privacyPolicy.section9.deletion')}</p>
            </Section>

            <Section id="data-sharing" title={t('privacyPolicy.section10.title')} icon={icons.sharing}>
              <p>{t('privacyPolicy.section10.intro')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section10.providers.title')}</h4>
              <p>{t('privacyPolicy.section10.providers.text')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section10.legal.title')}</h4>
              <p>{t('privacyPolicy.section10.legal.text')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section10.business.title')}</h4>
              <p>{t('privacyPolicy.section10.business.text')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section10.consent.title')}</h4>
              <p>{t('privacyPolicy.section10.consent.text')}</p>

              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mt-4">
                <p className="text-green-300 text-sm"><strong>{t('privacyPolicy.section10.noSale')}</strong></p>
              </div>
            </Section>

            <Section id="data-transfers" title={t('privacyPolicy.section11.title')} icon={icons.transfer}>
              <p>{t('privacyPolicy.section11.intro')}</p>

              <div className="space-y-3 mt-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-1">{t('privacyPolicy.section11.us.title')}</h4>
                  <ul className="text-gray-400 text-sm">
                    <li><strong>OpenAI</strong> - {t('privacyPolicy.section11.us.openai').split(' - ')[1]}</li>
                    <li><strong>Stripe</strong> - {t('privacyPolicy.section11.us.stripe').split(' - ')[1]}</li>
                    <li><strong>Google/Firebase</strong> - {t('privacyPolicy.section11.us.google').split(' - ')[1]}</li>
                  </ul>
                </div>
              </div>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section11.safeguards.title')}</h4>
              <p>{t('privacyPolicy.section11.safeguards.intro')}</p>
              <ul>
                <li>{t('privacyPolicy.section11.safeguards.item1')}</li>
                <li>{t('privacyPolicy.section11.safeguards.item2')}</li>
                <li>{t('privacyPolicy.section11.safeguards.item3')}</li>
              </ul>

              <p className="mt-4">
                {t('privacyPolicy.section11.request')} <a href="mailto:privacy@bodai.no" className="text-indigo-400 hover:underline">privacy@bodai.no</a>.
              </p>
            </Section>

            <Section id="your-rights" title={t('privacyPolicy.section12.title')} icon={icons.rights}>
              <p>{t('privacyPolicy.section12.intro')}</p>

              <div className="space-y-3 mt-4">
                <div className="flex gap-3">
                  <div className="text-indigo-400 mt-1">✓</div>
                  <div>
                    <h4 className="text-white font-medium">{t('privacyPolicy.section12.access.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('privacyPolicy.section12.access.text')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-indigo-400 mt-1">✓</div>
                  <div>
                    <h4 className="text-white font-medium">{t('privacyPolicy.section12.rectification.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('privacyPolicy.section12.rectification.text')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-indigo-400 mt-1">✓</div>
                  <div>
                    <h4 className="text-white font-medium">{t('privacyPolicy.section12.erasure.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('privacyPolicy.section12.erasure.text')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-indigo-400 mt-1">✓</div>
                  <div>
                    <h4 className="text-white font-medium">{t('privacyPolicy.section12.restriction.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('privacyPolicy.section12.restriction.text')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-indigo-400 mt-1">✓</div>
                  <div>
                    <h4 className="text-white font-medium">{t('privacyPolicy.section12.portability.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('privacyPolicy.section12.portability.text')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-indigo-400 mt-1">✓</div>
                  <div>
                    <h4 className="text-white font-medium">{t('privacyPolicy.section12.object.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('privacyPolicy.section12.object.text')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-indigo-400 mt-1">✓</div>
                  <div>
                    <h4 className="text-white font-medium">{t('privacyPolicy.section12.withdraw.title')}</h4>
                    <p className="text-gray-400 text-sm">{t('privacyPolicy.section12.withdraw.text')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 mt-4">
                <p className="text-indigo-300 text-sm">
                  <strong>{t('privacyPolicy.section12.howTo')}</strong> {t('privacyPolicy.section12.howToText')} <a href="mailto:privacy@bodai.no" className="underline">privacy@bodai.no</a>. {t('privacyPolicy.section12.responseTime')}
                </p>
              </div>
            </Section>

            <Section id="security" title={t('privacyPolicy.section13.title')} icon={icons.security}>
              <p>{t('privacyPolicy.section13.intro')}</p>

              <ul className="mt-4">
                <li><strong>{t('privacyPolicy.section13.encryption.label')}</strong> {t('privacyPolicy.section13.encryption.text')}</li>
                <li><strong>{t('privacyPolicy.section13.auth.label')}</strong> {t('privacyPolicy.section13.auth.text')}</li>
                <li><strong>{t('privacyPolicy.section13.access.label')}</strong> {t('privacyPolicy.section13.access.text')}</li>
                <li><strong>{t('privacyPolicy.section13.infra.label')}</strong> {t('privacyPolicy.section13.infra.text')}</li>
                <li><strong>{t('privacyPolicy.section13.monitoring.label')}</strong> {t('privacyPolicy.section13.monitoring.text')}</li>
              </ul>

              <p className="mt-4">
                {t('privacyPolicy.section13.note')} <a href="mailto:privacy@bodai.no" className="text-indigo-400 hover:underline">privacy@bodai.no</a>.
              </p>
            </Section>

            <Section id="cookies" title={t('privacyPolicy.section14.title')} icon={icons.cookies}>
              <p>{t('privacyPolicy.section14.intro')}</p>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section14.local.title')}</h4>
              <ul>
                <li><strong>{t('privacyPolicy.section14.local.item1.label')}</strong> {t('privacyPolicy.section14.local.item1.text')}</li>
                <li><strong>{t('privacyPolicy.section14.local.item2.label')}</strong> {t('privacyPolicy.section14.local.item2.text')}</li>
                <li><strong>{t('privacyPolicy.section14.local.item3.label')}</strong> {t('privacyPolicy.section14.local.item3.text')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section14.session.title')}</h4>
              <ul>
                <li>{t('privacyPolicy.section14.session.item1')}</li>
                <li>{t('privacyPolicy.section14.session.item2')}</li>
              </ul>

              <h4 className="text-white font-medium mt-4 mb-2">{t('privacyPolicy.section14.analytics.title')}</h4>
              <p>{t('privacyPolicy.section14.analytics.text')}</p>

              <p className="mt-4 text-gray-400 text-sm">{t('privacyPolicy.section14.clear')}</p>
            </Section>

            <Section id="children" title={t('privacyPolicy.section15.title')} icon={icons.children}>
              <p>{t('privacyPolicy.section15.p1')}</p>
              <p>
                {t('privacyPolicy.section15.p2')} <a href="mailto:privacy@bodai.no" className="text-indigo-400 hover:underline">privacy@bodai.no</a>. {t('privacyPolicy.section15.p2end')}
              </p>
            </Section>

            <Section id="changes" title={t('privacyPolicy.section16.title')} icon={icons.changes}>
              <p>{t('privacyPolicy.section16.p1')}</p>
              <p>{t('privacyPolicy.section16.p2')}</p>
              <ul>
                <li>{t('privacyPolicy.section16.item1')}</li>
                <li>{t('privacyPolicy.section16.item2')}</li>
                <li>{t('privacyPolicy.section16.item3')}</li>
              </ul>
              <p>{t('privacyPolicy.section16.p3')}</p>
            </Section>

            <Section id="contact" title={t('privacyPolicy.section17.title')} icon={icons.contact}>
              <p>{t('privacyPolicy.section17.intro')}</p>

              <div className="bg-gray-900/50 rounded-lg p-4 mt-4">
                <p className="text-gray-300 mb-3"><strong>{t('privacyPolicy.section17.team')}</strong></p>
                <p className="text-gray-400 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:privacy@bodai.no" className="text-indigo-400 hover:underline">privacy@bodai.no</a>
                </p>
              </div>

              <p className="mt-4">{t('privacyPolicy.section17.response')}</p>
            </Section>

            <Section id="complaints" title={t('privacyPolicy.section18.title')} icon={icons.complaint}>
              <p>{t('privacyPolicy.section18.intro')}</p>

              <div className="bg-gray-900/50 rounded-lg p-4 mt-4">
                <h4 className="text-white font-medium mb-2">{t('privacyPolicy.section18.authority')}</h4>
                <p className="text-gray-400 text-sm mb-1">{t('privacyPolicy.section18.authorityName')}</p>
                <p className="text-gray-400 text-sm">
                  {t('privacyPolicy.section18.website')} <a href="https://www.datatilsynet.no" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">www.datatilsynet.no</a>
                </p>
              </div>

              <p className="mt-4">
                {t('privacyPolicy.section18.encourage')} <a href="mailto:privacy@bodai.no" className="text-indigo-400 hover:underline">privacy@bodai.no</a> {t('privacyPolicy.section18.encourageEnd')}
              </p>
            </Section>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>{t('privacyPolicy.footer.copyright')}</p>
            <p className="mt-1">{t('privacyPolicy.footer.effective')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
