import { logEvent, Analytics } from 'firebase/analytics';
import { analytics } from '../firebase/config';

export const logAnalyticsEvent = (
  eventName: string,
  params?: { [key: string]: any }
): void => {
  if (analytics) {
    logEvent(analytics as Analytics, eventName, params);
  }
};
