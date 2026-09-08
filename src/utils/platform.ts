import { Capacitor } from '@capacitor/core';

// One canonical "are we the native iOS app or the web build" check, shared
// by IosStatusBar.tsx, SubscriptionPage.tsx, and platformLinks.ts, so it's
// never computed inconsistently in more than one place.
export const isNativeApp = Capacitor.isNativePlatform();
