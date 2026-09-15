'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const CONSENT_COOKIE_NAME = 'pt_analytics_consent';
const CONSENT_COOKIE_VERSION = 'v1';
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const OPEN_SETTINGS_EVENT = 'privateer-tales:open-cookie-settings';
const CONSENT_CHANGED_EVENT = 'privateer-tales:cookie-consent-changed';
const GOOGLE_SCRIPT_ID = 'privateer-tales-google-analytics';

type ConsentChoice = 'granted' | 'denied';
type ConsentSnapshot = ConsentChoice | 'loading' | null;
type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

function getMeasurementId() {
  const value = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim();
  return value && /^G-[A-Z0-9]+$/i.test(value) ? value.toUpperCase() : null;
}

function readConsentCookie(): ConsentChoice | null {
  const prefix = `${CONSENT_COOKIE_NAME}=`;
  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);

  if (value === `granted.${CONSENT_COOKIE_VERSION}`) return 'granted';
  if (value === `denied.${CONSENT_COOKIE_VERSION}`) return 'denied';
  return null;
}

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onStoreChange);
}

function getConsentSnapshot(): ConsentSnapshot {
  return readConsentCookie();
}

function getServerConsentSnapshot(): ConsentSnapshot {
  return 'loading';
}

function writeConsentCookie(choice: ConsentChoice) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE_NAME}=${choice}.${CONSENT_COOKIE_VERSION}; Path=/; Max-Age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

function getGtag(): Gtag {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });
  return window.gtag;
}

function setGoogleAnalyticsDisabled(measurementId: string, disabled: boolean) {
  const flags = window as unknown as Record<string, boolean>;
  flags[`ga-disable-${measurementId}`] = disabled;
}

function clearGoogleAnalyticsCookies() {
  const cookieNames = document.cookie
    .split('; ')
    .map((cookie) => cookie.split('=')[0])
    .filter((name) => name === '_ga' || name.startsWith('_ga_'));
  const hostname = window.location.hostname;
  const rootDomain = hostname.split('.').slice(-2).join('.');
  const domains = Array.from(
    new Set([hostname, `.${hostname}`, rootDomain, `.${rootDomain}`]),
  );
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  for (const name of cookieNames) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Domain=${domain}; Max-Age=0; SameSite=Lax${secure}`;
    }
  }
}

function denyAnalytics(measurementId: string) {
  setGoogleAnalyticsDisabled(measurementId, true);
  window.gtag?.('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  clearGoogleAnalyticsCookies();
}

function enableAnalytics(measurementId: string, pagePath: string) {
  const isFirstLoad = !document.getElementById(GOOGLE_SCRIPT_ID);
  const gtag = getGtag();

  setGoogleAnalyticsDisabled(measurementId, false);

  if (isFirstLoad) {
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }

  gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  if (isFirstLoad) {
    gtag('js', new Date());
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_path: pagePath,
  });
}

export function CookieSettingsButton({
  className,
  label = 'Cookie settings',
}: {
  className?: string;
  label?: string;
}) {
  if (!getMeasurementId()) return null;

  return (
    <button
      className={['cookie-settings-button', className]
        .filter(Boolean)
        .join(' ')}
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
    >
      {label}
    </button>
  );
}

export function AnalyticsConsent() {
  const pathname = usePathname();
  const measurementId = getMeasurementId();
  const choice = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const [settingsAreOpen, setSettingsAreOpen] = useState(false);
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!measurementId) return;

    const openSettings = () => setSettingsAreOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId) return;

    if (choice !== 'granted') {
      lastTrackedPath.current = null;
      if (choice === 'denied') denyAnalytics(measurementId);
      return;
    }

    const pagePath = `${window.location.pathname}${window.location.search}`;
    if (lastTrackedPath.current === pagePath) return;

    enableAnalytics(measurementId, pagePath);
    lastTrackedPath.current = pagePath;
  }, [choice, measurementId, pathname]);

  const isOpen = settingsAreOpen || choice === null;
  if (!measurementId || choice === 'loading' || !isOpen) return null;

  const saveChoice = (nextChoice: ConsentChoice) => {
    writeConsentCookie(nextChoice);
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
    setSettingsAreOpen(false);
  };

  return (
    <section
      className="cookie-consent"
      aria-labelledby="cookie-consent-title"
      aria-live="polite"
    >
      <div className="cookie-consent-copy">
        <h2 id="cookie-consent-title">Optional analytics</h2>
        <p>
          We use Google Analytics only if you allow it. It helps us understand
          which pages visitors use; it is never required to browse the site.{' '}
          <Link href="/privacy">Privacy &amp; cookies</Link>
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" onClick={() => saveChoice('denied')}>
          Decline
        </button>
        <button type="button" onClick={() => saveChoice('granted')}>
          Allow analytics
        </button>
      </div>
    </section>
  );
}
