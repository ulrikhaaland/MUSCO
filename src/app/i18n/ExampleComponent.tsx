import React from 'react';
import { useTranslation } from './index';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export default function ExampleComponent() {
  const { t } = useTranslation();
  
  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-800 rounded-xl shadow-md space-y-6 mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-medium text-white">{t('program.activity')}</h1>
        <LanguageSwitcher />
      </div>
      
      <p className="text-gray-300">{t('program.recoveryMessage')}</p>
      
      <div className="bg-gray-700 p-4 rounded-lg">
        <h2 className="text-lg font-medium text-white mb-3">{t('program.optionalRecovery')}</h2>
        <p className="text-gray-300">{t('program.recoveryMessage')}</p>
        
        <div className="mt-4">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg">
            {t('program.watchVideo')}
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mt-6">
        <p>{t('program.rest', { seconds: '30' })}</p>
      </div>
    </div>
  );
} 