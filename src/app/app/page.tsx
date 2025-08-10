'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import HumanViewer from '../components/3d/HumanViewer';
import { Gender } from '../types';
import { useApp, ProgramIntention } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { QuestionnaireAuthForm } from '../components/auth/QuestionnaireAuthForm';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { IntentionQuestion } from '../components/ui/IntentionQuestion';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { useTranslation } from '../i18n';

// The full application experience (moved from root to /app)
function AppContent() {
  const { setIntention, skipAuth, completeReset } = useApp();
  const { user, loading: authLoading, error: authError } = useAuth();
  const { pendingQuestionnaire } = useUser();
  const { t } = useTranslation();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [gender, setGender] = useState<Gender>('male');
  const [intentionSelected, setIntentionSelected] = useState(false);
  const [shouldResetModel, setShouldResetModel] = useState(false);

  // Set page title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('home.pageTitle');
    }
  }, [t]);

  // Reset to a clean state on mount
  useEffect(() => {
    completeReset();
    setShouldResetModel(true);
    const timer = setTimeout(() => setShouldResetModel(false), 500);
    return () => clearTimeout(timer);
  }, [completeReset]);

  const handleGenderChange = useCallback((newGender: Gender) => {
    setGender(newGender);
  }, []);

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

      {showAuthForm && pendingQuestionnaire && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-[70] flex items-center justify-center">
          <div className="max-w-lg w-full mx-4">
            <QuestionnaireAuthForm />
          </div>
        </div>
      )}

      {!intentionSelected && (
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


