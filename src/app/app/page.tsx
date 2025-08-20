'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import HumanViewer from '../components/3d/HumanViewer';
import { Gender } from '../types';
import { useApp, ProgramIntention } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useSearchParams, useRouter } from 'next/navigation';
import { IntentionQuestion } from '../components/ui/IntentionQuestion';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { useTranslation } from '../i18n';

// The full application experience (moved from root to /app)
function AppContent() {
  const { intention, setIntention, skipAuth, completeReset } = useApp();
  const { user, loading: authLoading, error: authError } = useAuth();
  const { pendingQuestionnaire } = useUser();
  const { t } = useTranslation();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const genderParam = searchParams?.get('gender') as Gender;
  const newParam = searchParams?.get('new');
  const handedOffIntention = searchParams?.get('intention') as 'recovery' | null;
  const [gender, setGender] = useState<Gender>(genderParam || 'male');
  const [intentionSelected, setIntentionSelected] = useState(false);
  const [shouldResetModel, setShouldResetModel] = useState(false);

  // Set page title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('home.pageTitle');
    }
  }, [t]);

  // Reset when not creating a new program
  useEffect(() => {
    if (newParam !== 'true' && intention !== ProgramIntention.None) {
      completeReset();
      setShouldResetModel(true);
      const timer = setTimeout(() => setShouldResetModel(false), 500);
      return () => clearTimeout(timer);
    }
  }, [completeReset, newParam, intention]);

  // Accept intention handoff via query or existing context to skip extra click
  useEffect(() => {
    if (newParam === 'true' && !intentionSelected) {
      // If intention provided in query, set it
      if (handedOffIntention === 'recovery') {
        setIntention(ProgramIntention.Recovery);
        setIntentionSelected(true);
      } else if (intention === ProgramIntention.Recovery) {
        // Use intention already present in context (e.g., from landing CTA)
        setIntentionSelected(true);
      }
    }
  }, [newParam, handedOffIntention, intention, intentionSelected, setIntention]);

  // Update gender when URL param changes
  useEffect(() => {
    if (genderParam && (genderParam === 'male' || genderParam === 'female')) {
      setGender(genderParam);
    }
  }, [genderParam]);

  // Prewarm: initialize assistant/thread as soon as /app mounts
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Per-tab guard to avoid duplicate prewarm (e.g., StrictMode or remounts)
        if (typeof window !== 'undefined') {
          const already = window.sessionStorage.getItem('assistant_prewarm');
          if (already === '1') return;
        }
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'initialize' }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && typeof window !== 'undefined') {
            try {
              if (data.assistantId) window.sessionStorage.setItem('assistant_id', data.assistantId);
              if (data.threadId) window.sessionStorage.setItem('assistant_thread_id', data.threadId);
              window.sessionStorage.setItem('assistant_prewarm', '1');
            } catch {}
          }
        }
      } catch {
        // best-effort; ignore
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenderChange = useCallback(
    (newGender: Gender) => {
      setGender(newGender);
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('gender', newGender);
      if (newParam === 'true' && !params.has('new')) params.set('new', 'true');
      router.push(`/app?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, newParam]
  );

  const handleIntentionSelect = useCallback(
    (selectedIntention: ProgramIntention) => {
      setIntention(selectedIntention);
      setIntentionSelected(true);
    },
    [setIntention]
  );

  // Auth overlay logic stays identical
  useEffect(() => {
    const hasPendingQuestionnaire = Boolean(pendingQuestionnaire);
    const hasPendingQuestionnaireFlag =
      typeof window !== 'undefined' &&
      window.localStorage.getItem('hasPendingQuestionnaire') === 'true';

    if (
      (hasPendingQuestionnaire && !user) ||
      (hasPendingQuestionnaireFlag && !user) ||
      (!user && !authLoading && !skipAuth)
    ) {
      setShowAuthForm(true);
    } else {
      setShowAuthForm(false);
    }
  }, [user, authLoading, skipAuth, pendingQuestionnaire, showAuthForm]);

  if (authError) return <ErrorDisplay error={authError} />;

  return (
    <div className="h-full">
      <div>
        <HumanViewer
          gender={gender}
          onGenderChange={handleGenderChange}
          shouldResetModel={shouldResetModel}
        />
      </div>

      {/* Auth overlay handled globally in layout via <AuthOverlay /> */}

      {newParam === 'true' && !intentionSelected && (
        <IntentionQuestion
          onSelect={(selectedIntention) => {
            handleIntentionSelect(selectedIntention);
          }}
        />
      )}
    </div>
  );
}

export default function AppPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <AppContent />
      </Suspense>
    </ErrorBoundary>
  );
}


