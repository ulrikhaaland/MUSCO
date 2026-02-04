'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

import { useTranslation } from './i18n';
import {
  getProgramBySlug,
  localizeProgramDayDescriptions,
} from '../../public/data/programs/recovery';
import PartnerLogos from '@/components/PartnerLogos';
// import LanguageSwitcher from './components/ui/LanguageSwitcher';
import { logAnalyticsEvent } from './utils/analytics';
import PricingCards from './components/ui/PricingCards';
import { useUser } from './context/UserContext';
import HumanViewer from './components/3d/HumanViewer';

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
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState<null | string>(null);
  const [_pricingAnnual, _setPricingAnnual] = useState(true);
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [_exploreInput, _setExploreInput] = useState('');
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
  const heroRef = useRef<HTMLDivElement | null>(null);
  const programsRef = useRef<HTMLDivElement | null>(null);
  const demoRef = useRef<HTMLDivElement | null>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const [currentSection, setCurrentSection] = useState<
    'how' | 'programs' | 'demo' | 'pricing' | 'top'
  >('top');
  // demo elements removed
  const SHOW_PRICING = true;

  // Ensure landing page starts at top and prevent browser scroll restoration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { history } = window;
    const prev = (history as any).scrollRestoration;
    try {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    } catch {
      // ignore
    }
    // Only force to top if no hash in URL
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
    return () => {
      try {
        if ('scrollRestoration' in history) {
          history.scrollRestoration = prev || 'auto';
        }
      } catch {
        // ignore
      }
    };
  }, []);

  // Soft-redirect signed-in users to /app (delay ~800ms), always show Open app
  useEffect(() => {
    if (authLoading || userLoading) return;
    if (user) {
      if (program) {
        router.replace('/program');
      } else {
        router.replace('/app');
      }
    }
  }, [user, router, authLoading, userLoading, program]);

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = t('home.pageTitle');
  }, [t]);

  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const _goAppWith = () => {
    router.push('/app');
  };

  // Observe section views
  useEffect(() => {
    const updateActive = () => {
      if (typeof window === 'undefined') return;
      const header = document.querySelector('header') as HTMLElement | null;
      const headerHeight = header?.offsetHeight ?? 64;
      const offset = headerHeight + 8;
      const line = offset + window.innerHeight * 0.33; // choose a line 1/3 down from top

      const sections: Array<{ id: typeof currentSection; el: Element | null }> =
        [
          { id: 'how', el: heroRef.current || howRef.current },
          { id: 'programs', el: programsRef.current },
          { id: 'pricing', el: SHOW_PRICING ? pricingRef.current : null },
        ];
      // Prefer the section whose bounds contain the reference line
      const visibles: Array<{
        id: typeof currentSection;
        start: number;
        end: number;
      }> = [];
      sections.forEach((s) => {
        if (!s.el) return;
        const rect = (s.el as HTMLElement).getBoundingClientRect();
        const start = rect.top;
        const end = rect.bottom;
        visibles.push({ id: s.id, start, end });
      });
      const spanning = visibles.find((v) => v.start <= line && v.end > line);
      if (spanning) {
        setCurrentSection(spanning.id);
        return;
      }
      // Otherwise pick the closest section above the line
      const passed = visibles.filter((v) => v.start <= line);
      if (passed.length) {
        const closest = passed.reduce((a, b) => (a.start > b.start ? a : b));
        setCurrentSection(closest.id);
        return;
      }
      // Fallback to the first section
      setCurrentSection('how');
    };
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [SHOW_PRICING]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;
    const header = document.querySelector('header') as HTMLElement | null;
    const headerHeight = header?.offsetHeight ?? 64;
    const extraSpacing = 8; // small breathing room below sticky header
    const y =
      el.getBoundingClientRect().top +
      window.pageYOffset -
      headerHeight -
      extraSpacing;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

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
  const defaultVisible = isMobile ? 3 : 6;
  const visiblePrograms = showAllPrograms
    ? sortedPrograms
    : sortedPrograms.slice(0, defaultVisible);

  // Shimmer removed

  return (
    <div className="min-h-screen bg-surface-deepest">
      {/* Top Nav (landing only) */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-[0.45rem] md:py-3 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Home"
            className="text-white font-bold text-xl tracking-tight"
          >
            bod<span className="text-indigo-500 font-extrabold">AI</span>
          </button>
          <nav className="hidden md:flex items-center gap-6 text-gray-300">
            {/* <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${currentSection === 'how' ? 'text-white' : ''}`}
            >
              {t('landing.nav.how')}
            </button> */}
            <button
              onClick={() => scrollTo(demoRef)}
              className={`hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${currentSection === 'demo' ? 'text-white' : ''}`}
            >
              {t('landing.nav.demo')}
            </button>
            <button
              onClick={() => scrollTo(programsRef)}
              className={`hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${currentSection === 'programs' ? 'text-white' : ''}`}
            >
              {t('landing.nav.programs')}
            </button>
            {false && (
              <button
                onClick={() => scrollTo(pricingRef)}
                className={`hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 ${currentSection === 'pricing' ? 'text-white' : ''}`}
              >
                {t('landing.nav.pricing')}
              </button>
            )}
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
          </div>
        </div>
      </header>

      {/* Hero */}
      {/* <section ref={heroRef} className="mx-auto max-w-6xl px-6 py-12 md:py-16 md:min_h-[60vh] flex items-start">
        <LandingHero
          onSelect={(mode) => {
            if (mode === 'diagnose') {
              logAnalyticsEvent('hero_cta_click', { cta: 'diagnose' });
              goAppWith();
            } else {
              logAnalyticsEvent('hero_cta_click', { cta: 'workout' });
              router.push('/app/questionnaire');
            }
          }}
        />
      </section> */}  

      {/* Partner logos below hero (animated marquee) */}
      {/* <section className="mx-auto max-w-6xl px-6 mt-12 md:mt-16 lg:mt-24 mb-12 md:mb-16 lg:mb-24">
        <PartnerLogos />
      </section> */}

      {/* Hero section: Model + Partners filling viewport */}
      <section
        ref={demoRef}
        className="flex flex-col px-6"
        style={{
          height: 'calc(100svh - 3rem - env(safe-area-inset-bottom, 0px))',
          minHeight: '400px',
        }}
      >
        {/* Model viewer - fills available space */}
        <div className="flex-1 min-h-0 w-full max-w-6xl mx-auto flex flex-col">
          <h2 className="text-white text-1xl font-semibold mb-2 mt-2 flex-shrink-0">
            {t('landing.demo.assistantTitle')}
          </h2>
          <div className="flex-1 min-h-0 w-full rounded-xl ring-1 ring-white/10 overflow-hidden">
            <HumanViewer gender={'male'} hideNav enableMobileChat fillHeight />
          </div>
        </div>

        {/* Partner logos - fixed at bottom */}
        <div className="flex-shrink-0 w-full max-w-6xl mx-auto mt-4">
          <PartnerLogos />
        </div>
      </section>

      {/* Programs we cover */}
      <section
        ref={programsRef}
        className="mx-auto max-w-6xl px-6 pb-12 md:pb-16 lg:pb-24"
      >
        <h2 className="text-white text-1xl font-semibold mb-4">
          {t('landing.programs.title')}
        </h2>
        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {visiblePrograms.map(({ key, slug, img }) => (
            <button
              key={key}
              className="group h-full text-left rounded-xl overflow-hidden bg-surface-elevated ring-1 ring-white/12 shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => {
                logAnalyticsEvent('program_card_open', { condition: key });
                router.push(`/program/${slug}`);
              }}
            >
              <div className="flex h-full items-stretch min-h-[88px]">
                <div className="w-24 sm:w-28 md:w-32 xl:w-36 h-full bg-surface-deepest border-r border-white/10 overflow-hidden">
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
                      programCards.find((p) => p.slug === slug)?.summary ||
                      'Personalized plan with progressive weekly focus.'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {sortedPrograms.length > defaultVisible && (
          <div className="mt-6">
            <button
              onClick={() => setShowAllPrograms((s) => !s)}
              className="px-4 py-2 rounded-md border border-white/20 text-white/90 hover:text-white hover:bg-white/5"
            >
              {showAllPrograms ? t('program.seeLess') : t('program.seeMore')}
            </button>
          </div>
        )}
      </section>

      {/* shimmer styles removed */}

      {/* Pricing */}
      {false && (
        <section
          ref={pricingRef}
          className="mx-auto max-w-6xl px-6 mb-12 md:mb-16 lg:mb-24"
        >
          <h2 className="text-white text-2xl font-semibold mb-3">
            {t('landing.pricing.title')}
          </h2>
          <PricingCards
            onMonthly={() => router.push('/subscribe')}
            onAnnual={() => router.push('/subscribe')}
            onTry={() => router.push('/app')}
            loading={null}
            showFounder={false}
            benefitsBg="bg-surface-elevated"
            benefitsRing="ring-1 ring-white/10"
            cardBg="bg-surface-elevated"
            cardRing="ring-1 ring-white/10"
            showFooterNote
          />
        </section>
      )}

      {/* Program modal */}
      <ProgramPreviewModal
        isOpen={modalOpen !== null}
        onClose={() => setModalOpen(null)}
        title={modalOpen ? t(`landing.programs.${modalOpen}`) : ''}
      />
    </div>
  );
}
