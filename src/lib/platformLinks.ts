import { isNativeApp } from '../utils/platform';

// A native WKWebView shell's default handling of window.open/target="_blank"
// either does nothing or opens an uncontrolled system browser with no
// "back to app" affordance, so external links go through Capacitor's
// Browser plugin (an in-app browser sheet) there instead. Dynamically
// imported so the plugin never loads into the web build's bundle.
export async function openExternalUrl(url: string): Promise<void> {
  if (isNativeApp) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Apple's own subscription-management screen — the native equivalent of
// RevenueCat's web billing portal URL (`subscription.managementURL`), which
// doesn't apply once purchases go through native StoreKit.
export async function openNativeSubscriptionManagement(): Promise<void> {
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url: 'itms-apps://apps.apple.com/account/subscriptions' });
}
