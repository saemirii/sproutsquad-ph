import { Capacitor } from '@capacitor/core';

// One canonical "are we the native iOS app or the web build" check, shared
// by IosStatusBar.tsx, SubscriptionPage.tsx, and platformLinks.ts, so it's
// never computed inconsistently in more than one place.
export const isNativeApp = Capacitor.isNativePlatform();

// The native app's web content is served from capacitor://localhost, which
// isn't a real server — a relative fetch('/api/...') resolves against that
// scheme and never reaches the actual backend. The web build, by contrast,
// is served *by* that backend (Netlify), so relative paths are same-origin
// and correct as-is. Every call to one of this app's own /api/* routes
// (e.g. deleteAccount) must be prefixed with this constant.
export const API_BASE_URL = isNativeApp ? (import.meta.env.VITE_APP_URL as string | undefined) ?? '' : '';
