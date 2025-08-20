import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { QuestionnaireAuthForm } from './QuestionnaireAuthForm';

export function AuthOverlay() {
  const { user, loading } = useAuth();
  const { pendingQuestionnaire } = useUser();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasFlag =
      typeof window !== 'undefined' &&
      window.localStorage.getItem('hasPendingQuestionnaire') === 'true';
    setVisible(!user && (Boolean(pendingQuestionnaire) || hasFlag));
  }, [user, pendingQuestionnaire]);

  if (!visible || loading) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-[70000] flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <QuestionnaireAuthForm />
      </div>
    </div>
  );
}
