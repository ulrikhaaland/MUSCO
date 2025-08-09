'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { useApp, ProgramIntention } from './context/AppContext';
import { useTranslation } from './i18n';
import {
  getProgramBySlug,
  localizeProgramDayDescriptions,
} from '../../public/data/programs/recovery';
import LandingHero from './components/ui/LandingHero';
import LanguageSwitcher from './components/ui/LanguageSwitcher';
import { logAnalyticsEvent } from './utils/analytics';
import Logo from './components/ui/Logo';
import { useUser } from './context/UserContext';

function ProgramPreviewModal({
  isOpen,
  onClose,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-gray-900 border border-gray-700 rounded-xl max-w-xl w-full m-4 p-4 focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
          <button
            className="text-gray-300 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="text-gray-200 text-sm space-y-2">
          <p className="font-medium">
            Week 1 • Day 1 • 20 min: Mobility & activation
          </p>
          <p>Mon: Mobility & stability</p>
          <p>Tue: Strength — key lifts</p>
          <p>Wed: Active recovery</p>
          <p>Thu: Strength — accessories</p>
          <p>Fri: Conditioning</p>
          <p>Sat: Optional walk + stretch</p>
          <p>Sun: Rest</p>
          <hr className="my-3 border-white/10" />
          <p className="font-medium">Sample exercises</p>
          <ul className="list-disc pl-5">
            <li>Dead bug — core control</li>
            <li>Hip hinge — patterning</li>
            <li>Glute bridge — activation</li>
          </ul>
          <p className="text-gray-400 mt-2">
            Follow the plan gently and stop if symptoms worsen.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const { program, isLoading: userLoading } = useUser();
  const { setIntention } = useApp();
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState<null | string>(null);
  const [pricingAnnual, setPricingAnnual] = useState(true);
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const programSummaries: Record<string, string> = {
    'lower-back':
      'Stabilize core and restore lumbar mobility; posture and hinge control.',
    'runners-knee':
      'Reduce patellofemoral load; hip strength + cadence / landing tweaks.',
    shoulder: 'Scapular control and rotator cuff capacity; overhead tolerance.',
    'tech-neck':
      'Cervical mobility with deep neck flexor strength; posture hygiene.',
    'ankle-sprain':
      'Ankle mobility + balance; progressive return to loading and impact.',
    'plantar-fasciitis':
      'Foot intrinsics and calf capacity; morning stiffness relief.',
    'tennis-elbow':
      'Eccentric wrist/forearm loading; grip strength and tissue tolerance.',
    hamstring:
      'Posterior chain strength; hinge mechanics and eccentric capacity.',
    'upper-back-core':
      'Thoracic mobility + trunk strength; postural endurance.',
    'core-stability':
      'Anti-rotation and bracing skills for daily and sport demands.',
    'shin-splints':
      'Deload impact; ankle/calf mobility and isometric capacity in week 1.',
  };
  const howRef = useRef<HTMLDivElement | null>(null);
  const programsRef = useRef<HTMLDivElement | null>(null);
  const whyRef = useRef<HTMLDivElement | null>(null);
  const demoRef = useRef<HTMLDivElement | null>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);
  const [currentSection, setCurrentSection] = useState<
    'how' | 'programs' | 'why' | 'demo' | 'pricing' | 'faq' | 'top'
  >('top');
  const [demoTapCount, setDemoTapCount] = useState(0);
  const [demoTyping, setDemoTyping] = useState(false);
  const SHOW_PRICING = true;

  // Soft-redirect signed-in users to /app (delay ~800ms), always show Open app
  useEffect(() => {
    if (authLoading || userLoading) return;

    if (program) {
      router.replace('/program');
    } else {
      router.replace('/app');
    }
  }, [user, router, authLoading, userLoading, program]);

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = t('home.pageTitle');
  }, [t]);

  const goAppWith = (target: ProgramIntention) => {
    setIntention(target);
    const intentionParam =
      target === ProgramIntention.Exercise ? 'exercise' : 'recovery';
    router.push(`/app?new=true&intention=${intentionParam}`);
  };

  // Observe section views
  useEffect(() => {
    const entries: Array<[Element | null, string]> = [
      [howRef.current, 'how'],
      [programsRef.current, 'programs'],
      [whyRef.current, 'why'],
      [demoRef.current, 'demo'],
      [SHOW_PRICING ? pricingRef.current : null, 'pricing'],
      [faqRef.current, 'faq'],
    ];
    const observer = new IntersectionObserver(
      (list) => {
        list.forEach((i) => {
          if (i.isIntersecting) {
            logAnalyticsEvent('landing_section_view', {
              id: i.target.getAttribute('data-id'),
            });
            const id = i.target.getAttribute('data-id') as any;
            setCurrentSection(id);
          }
        });
      },
      { threshold: 0.4 }
    );
    entries.forEach(([el, id]) => {
      if (el) {
        el.setAttribute('data-id', id);
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, [SHOW_PRICING]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Program cards data and ordering by approximate commonality
  const programCardsBase = [
    { key: 'lower_back', slug: 'lower-back', img: '/bodyparts/lower_back.png' },
    { key: 'shoulder_pain', slug: 'shoulder', img: '/bodyparts/shoulders.png' },
    { key: 'runners_knee', slug: 'runners-knee', img: '/bodyparts/knees.png' },
    { key: 'ankle_sprain', slug: 'ankle-sprain', img: '/bodyparts/feet.png' },
    {
      key: 'plantar_fasciitis',
      slug: 'plantar-fasciitis',
      img: '/bodyparts/feet.png',
    },
    { key: 'tech_neck', slug: 'techneck', img: '/bodyparts/neck.png' },
    {
      key: 'hamstring_strain',
      slug: 'hamstring',
      img: '/bodyparts/upper_legs_behind.png',
    },
    {
      key: 'upper_back_core',
      slug: 'upper-back-core',
      img: '/bodyparts/upper_back_and_core.png',
    },
    {
      key: 'core_stability',
      slug: 'core-stability',
      img: '/bodyparts/abdomen.png',
    },
    { key: 'tennis_elbow', slug: 'tennis-elbow', img: '/bodyparts/elbows.png' },
    { key: 'shin_splints', slug: 'shin-splints', img: '/bodyparts/shin.png' },
  ];
  // Pull short summaries from source programs for sync; fallback to local mapping
  const programCards = programCardsBase.map(({ key, slug, img }) => {
    let summary = programSummaries[slug as keyof typeof programSummaries];
    const base = getProgramBySlug(slug);
    if (base) {
      const localized =
        locale === 'nb' ? localizeProgramDayDescriptions(base, 'nb') : base;
      if (localized?.summary) summary = localized.summary as string;
    }
    return { key, slug, img, summary } as {
      key: string;
      slug: string;
      img: string;
      summary: string;
    };
  });
  const commonalityRank: Record<string, number> = {
    'lower-back': 1,
    shoulder: 2,
    'runners-knee': 3,
    'ankle-sprain': 4,
    'plantar-fasciitis': 5,
    techneck: 6,
    hamstring: 7,
    'upper-back-core': 8,
    'core-stability': 9,
    'tennis-elbow': 10,
    'shin-splints': 11,
  };
  const sortedPrograms = [...programCards].sort(
    (a, b) =>
      (commonalityRank[a.slug] ?? 999) - (commonalityRank[b.slug] ?? 999)
  );
  const visiblePrograms = showAllPrograms
    ? sortedPrograms
    : sortedPrograms.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0E1116]">
      {/* Top Nav (landing only) */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Home"
          >
            <Logo />
          </button>
          <nav className="hidden md:flex items-center gap-6 text-gray-300">
            <button
              onClick={() => scrollTo(howRef)}
              className={`hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${currentSection === 'how' ? 'text-white' : ''}`}
            >
              {t('landing.nav.how')}
            </button>
            <button
              onClick={() => scrollTo(programsRef)}
              className={`hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${currentSection === 'programs' ? 'text-white' : ''}`}
            >
              {t('landing.nav.programs')}
            </button>
            <button
              onClick={() => scrollTo(whyRef)}
              className={`hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${currentSection === 'why' ? 'text-white' : ''}`}
            >
              {t('landing.nav.why')}
            </button>
            {SHOW_PRICING && (
              <button
                onClick={() => scrollTo(pricingRef)}
                className={`hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${currentSection === 'pricing' ? 'text-white' : ''}`}
              >
                {t('landing.nav.pricing')}
              </button>
            )}
            <button
              onClick={() => scrollTo(faqRef)}
              className={`hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${currentSection === 'faq' ? 'text-white' : ''}`}
            >
              {t('landing.nav.faq')}
            </button>
          </nav>
          <div className="flex items-center gap-3">
            {!user && (
              <button
                onClick={() => {
                  logAnalyticsEvent('nav_click', { target: 'signin' });
                  router.push('/login');
                }}
                className="px-3 py-2 rounded-md text-sm text-white/90 hover:text-white border border-white/20"
              >
                {t('auth.signIn')}
              </button>
            )}
            <button
              onClick={() => {
                logAnalyticsEvent('open_app_from_landing');
                router.push('/app');
              }}
              className="px-3 py-2 rounded-md text-sm bg-gray-800 text-white hover:bg-gray-700"
            >
              {t('landing.footer.openApp')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-24 pb-16 md:pb-24 min-h-[72vh] flex items-center">
        <LandingHero
          onSelect={(mode) => {
            if (mode === 'diagnose') {
              logAnalyticsEvent('hero_cta_click', { cta: 'diagnose' });
              goAppWith(ProgramIntention.Recovery);
            } else {
              logAnalyticsEvent('hero_cta_click', { cta: 'workout' });
              goAppWith(ProgramIntention.Exercise);
            }
          }}
        />
      </section>

      {/* How it works */}
      <section ref={howRef} className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h2 className="text-white text-2xl font-semibold mb-4">
          {t('landing.how.title')}
        </h2>
        <ol className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 text-gray-200">
          {[
            t('landing.how.step1'),
            t('landing.how.step2'),
            t('landing.how.step3'),
          ].map((txt, idx) => (
            <li
              key={idx}
              className="rounded-xl p-5 border border-white/15 bg-[#141922]"
            >
              <div className="text-sm text-white/70 mb-2">Step {idx + 1}</div>
              <div className="text-white font-medium">{txt}</div>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <button
            onClick={() => {
              logAnalyticsEvent('start_diagnosis_from_section');
              goAppWith(ProgramIntention.Recovery);
            }}
            className="px-5 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
          >
            {t('landing.how.cta')}
          </button>
        </div>
      </section>

      {/* Programs we cover */}
      <section
        ref={programsRef}
        className="mx-auto max-w-6xl px-6 py-16 md:py-24"
      >
        <h2 className="text-white text-2xl font-semibold mb-4">
          {t('landing.programs.title')}
        </h2>
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {visiblePrograms.map(({ key, slug, img }) => (
            <button
              key={key}
              className="group h-full text-left rounded-xl overflow-hidden bg-[#141922] ring-1 ring-white/12 shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => {
                logAnalyticsEvent('program_card_open', { condition: key });
                router.push(`/program/${slug}`);
              }}
            >
              <div className="flex h-full items-stretch min-h-[88px]">
                {/* Image pane hugging the left border, inherits rounded-l-xl */}
                <div className="w-24 sm:w-28 md:w-32 xl:w-36 h-full bg-[#0E1116] border-r border-white/10 overflow-hidden">
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-start">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-white font-medium tracking-tight">
                      {t(`landing.programs.${key}`)}
                    </div>
                    <svg
                      className="mt-1 h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                  <div className="text-[12px] text-white/75 mt-1">
                    {programSummaries[slug] ||
                      programSummaries[slug] ||
                      programCards.find((p) => p.slug === slug)?.summary ||
                      'Personalized plan with progressive weekly focus.'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {sortedPrograms.length > 6 && (
          <div className="mt-4">
            <button
              onClick={() => setShowAllPrograms((v) => !v)}
              className="px-5 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700"
            >
              {showAllPrograms ? t('program.seeLess') : t('program.seeMore')}
            </button>
          </div>
        )}
      </section>

      {/* Why it works */}
      <section ref={whyRef} className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h2 className="text-white text-2xl font-semibold mb-4">
          {t('landing.why.title')}
        </h2>
        <ul className="grid gap-2 md:grid-cols-2 text-gray-200 list-disc pl-5">
          <li>{t('landing.why.digitalTwin')}</li>
          <li>{t('landing.why.dualAssistants')}</li>
          <li>{t('landing.why.personalization')}</li>
          <li>{t('landing.why.safety')}</li>
          <li>{t('landing.why.speed')}</li>
        </ul>
        <p className="text-xs text-gray-400 mt-3">
          {t('landing.why.disclaimer')}
        </p>
      </section>

      {/* Optional fake demo */}
      <section ref={demoRef} className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h2 className="text-white text-2xl font-semibold mb-4">
          {t('landing.demo.title')}
        </h2>
        <div className="rounded-xl p-5 border border-white/15 bg-[#141922] text-gray-200">
          <div className="mb-3 min-h-[80px]">
            <p>{t('landing.demo.chat')}</p>
            {demoTyping && (
              <div
                className="mt-2 h-4 w-24 bg-white/10 rounded animate-pulse"
                aria-hidden
              />
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600"
                onClick={() => {
                  setDemoTapCount((c) => c + 1);
                  setDemoTyping(true);
                  setTimeout(() => setDemoTyping(false), 350);
                  logAnalyticsEvent('fake_demo_interaction', { step });
                }}
              >
                {t(`landing.demo.quick${step}`)}
              </button>
            ))}
          </div>
          {demoTapCount >= 2 && (
            <div className="mt-4">
              <button
                className="px-5 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                onClick={() => goAppWith(ProgramIntention.Recovery)}
              >
                {t('landing.demo.cta')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Pricing */}
      {SHOW_PRICING && (
        <section
          ref={pricingRef}
          className="mx-auto max-w-3xl px-6 py-16 md:py-24"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white text-2xl font-semibold">
              {t('landing.pricing.title')}
            </h2>
            <label className="text-gray-200 text-sm flex items-center gap-2">
              {t('landing.pricing.monthly')}
              <input
                type="checkbox"
                aria-label={t('landing.pricing.toggle')}
                checked={pricingAnnual}
                onChange={(e) => setPricingAnnual(e.target.checked)}
                className="accent-indigo-600"
              />
              {t('landing.pricing.annual')}
            </label>
          </div>
          <div className="rounded-xl p-5 border border-white/15 bg-[#141922] text-gray-200">
            <p className="text-3xl font-bold text-white">
              {pricingAnnual
                ? t('landing.pricing.annualPrice')
                : t('landing.pricing.monthlyPrice')}
            </p>
            <p className="text-sm mt-1">{t('landing.pricing.note')}</p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/app?new=true')}
                className="px-5 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                {t('landing.pricing.try')}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section ref={faqRef} className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h2 className="text-white text-2xl font-semibold mb-4">
          {t('landing.faq.title')}
        </h2>
        <details className="rounded-xl p-4 border border-white/15 bg-[#141922] text-gray-200 mb-2">
          <summary className="cursor-pointer">{t('landing.faq.q1')}</summary>
          <p className="mt-2 text-sm">{t('landing.faq.a1')}</p>
        </details>
        <details className="rounded-xl p-4 border border-white/15 bg-[#141922] text-gray-200 mb-2">
          <summary className="cursor-pointer">{t('landing.faq.q2')}</summary>
          <p className="mt-2 text-sm">{t('landing.faq.a2')}</p>
        </details>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-white/10 text-gray-300">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <LanguageSwitcher showFullNames />
          <button
            onClick={() => {
              logAnalyticsEvent('open_app_from_landing');
              router.push('/app');
            }}
            className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700"
          >
            {t('landing.footer.openApp')}
          </button>
        </div>
      </footer>

      {/* Program modal */}
      <ProgramPreviewModal
        isOpen={modalOpen !== null}
        onClose={() => setModalOpen(null)}
        title={modalOpen ? t(`landing.programs.${modalOpen}`) : ''}
      />
    </div>
  );
}
