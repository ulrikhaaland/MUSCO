// Export all translation related functionality
export * from './translations';
export * from './TranslationContext';
 
// Re-export common functions for easier imports
export { useTranslation } from './TranslationContext';
export { t, addTranslation, hasTranslation } from './translations'; 