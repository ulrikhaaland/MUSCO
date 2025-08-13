'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from '@/app/i18n';
import { addTranslation, Locale } from '@/app/i18n';
import LanguageSwitcher from '@/app/components/ui/LanguageSwitcher';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';

// Initial empty state for a new translation
const emptyTranslation = {
  key: '',
  text: '',
  locale: 'en' as Locale
};

function TranslationsPageContent() {
  const { t, locale } = useTranslation();
  const [newTranslation, setNewTranslation] = useState(emptyTranslation);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [savedTranslations, setSavedTranslations] = useState<Array<{key: string, text: string, locale: Locale}>>([]);
  
  // Load translations from localStorage on page load
  useEffect(() => {
    const saved = localStorage.getItem('savedTranslations');
    if (saved) {
      try {
        setSavedTranslations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved translations', e);
      }
    }
  }, []);
  
  // Save translations to localStorage when they change
  useEffect(() => {
    if (savedTranslations.length) {
      localStorage.setItem('savedTranslations', JSON.stringify(savedTranslations));
    }
  }, [savedTranslations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTranslation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!newTranslation.key || !newTranslation.text) {
      setMessage({ text: t('admin.keyAndTextRequired'), type: 'error' });
      return;
    }
    
    // Add the translation
    try {
      addTranslation(newTranslation.key, newTranslation.locale as Locale, newTranslation.text);
      
      // Save to our local record
      setSavedTranslations(prev => [...prev, { ...newTranslation }]);
      
      // Reset form text but keep locale
      setNewTranslation({...emptyTranslation, locale: newTranslation.locale});
      setMessage({ text: t('admin.translationAddedSuccess'), type: 'success' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: t('admin.translationAddError'), type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <NavigationMenu mobileTitle={t('admin.translationManagement')} />
      <div className="max-w-4xl mx-auto p-6 w-full flex-1">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">{t('admin.translationManagement')}</h1>
        <LanguageSwitcher showFullNames />
      </div>
      
      {message && (
        <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-800/50 text-green-100' : 'bg-red-800/50 text-red-100'}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-medium text-white mb-4">{t('admin.addNewTranslation')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-300 mb-1">
              {t('admin.translationKey')}
            </label>
            <input
              type="text"
              id="key"
              name="key"
              value={newTranslation.key}
              onChange={handleInputChange}
              placeholder="e.g., &apos;feature.button.save&apos;"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">{t('admin.dotNotationTip')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="locale" className="block text-sm font-medium text-gray-300 mb-1">
                {t('common.language')}
              </label>
              <select
                id="locale"
                name="locale"
                value={newTranslation.locale}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="en">English (EN)</option>
                <option value="nb">Norwegian (NB)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-1">
                {t('admin.translationText')}
              </label>
              <textarea
                id="text"
                name="text"
                value={newTranslation.text}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
            >
              {t('admin.addTranslation')}
            </button>
          </div>
        </form>
      </div>
      
      {savedTranslations.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-medium text-white mb-4">{t('admin.addedTranslations')}</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-300">{t('admin.translationKey')}</th>
                  <th className="py-3 px-4 text-gray-300">{t('common.language')}</th>
                  <th className="py-3 px-4 text-gray-300">{t('admin.translationText')}</th>
                </tr>
              </thead>
              <tbody>
                {savedTranslations.map((translation, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-3 px-4 text-gray-300 font-mono text-sm">{translation.key}</td>
                    <td className="py-3 px-4 text-white">{translation.locale.toUpperCase()}</td>
                    <td className="py-3 px-4 text-white">{translation.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// Loading fallback UI
function LoadingTranslations() {
  return (
    <div className="max-w-4xl mx-auto p-6 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function TranslationsPage() {
  return (
    <Suspense fallback={<LoadingTranslations />}>
      <TranslationsPageContent />
    </Suspense>
  );
} 