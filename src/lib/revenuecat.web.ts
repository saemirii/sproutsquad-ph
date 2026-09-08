import {
  Purchases,
  PurchasesError,
  ErrorCode,
  type CustomerInfo,
  type Offerings,
  type Package,
  type PurchaseResult,
} from '@revenuecat/purchases-js';
import { buildSubscriptionStatus } from './revenuecatConstants';

// Web Billing SDK implementation. Only ever imported dynamically by
// `revenuecat.ts` (the platform dispatcher) when running as a plain web
// build — never import '@revenuecat/purchases-js' from anywhere else, so the
// SDK can be swapped/upgraded without touching UI code.

const REVENUECAT_PUBLIC_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY as string | undefined;

export const isConfigured = Boolean(REVENUECAT_PUBLIC_KEY);

function getConfiguredInstance(): Purchases | null {
  if (!isConfigured) return null;
  if (!Purchases.isConfigured()) return null;
  return Purchases.getSharedInstance();
}

/**
 * Identifies (or configures, on first call) RevenueCat for the given stable
 * SproutSquad user id. Safe to call every time a user's session becomes
 * available — it only calls the network when the identified user actually
 * changes.
 */
export async function identifyRevenueCatUser(appUserId: string): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;

  if (!Purchases.isConfigured()) {
    const purchases = Purchases.configure({ apiKey: REVENUECAT_PUBLIC_KEY as string, appUserId });
    return purchases.getCustomerInfo();
  }

  const purchases = Purchases.getSharedInstance();
  if (purchases.getAppUserId() === appUserId) {
    return purchases.getCustomerInfo();
  }
  return purchases.changeUser(appUserId);
}

/**
 * Resets RevenueCat back to a fresh anonymous identity on sign-out, so the
 * next person to use this browser/tab never inherits the previous user's
 * entitlements.
 */
export async function resetRevenueCatUser(): Promise<void> {
  const purchases = getConfiguredInstance();
  if (!purchases) return;
  if (purchases.isAnonymous()) return;
  await purchases.changeUser(Purchases.generateRevenueCatAnonymousAppUserId());
}

export async function fetchSproutPlusOfferings(): Promise<Offerings> {
  const purchases = getConfiguredInstance();
  if (!purchases) throw new Error('RevenueCat is not configured. Set VITE_REVENUECAT_PUBLIC_KEY.');
  return purchases.getOfferings();
}

export async function purchaseSproutPlus(pkg: Package): Promise<PurchaseResult> {
  const purchases = getConfiguredInstance();
  if (!purchases) throw new Error('RevenueCat is not configured. Set VITE_REVENUECAT_PUBLIC_KEY.');
  return purchases.purchase({ rcPackage: pkg });
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  const purchases = getConfiguredInstance();
  if (!purchases) return null;
  return purchases.getCustomerInfo();
}

// The Web Billing SDK ties purchases to the identified app user id directly —
// there's no separate device/store receipt to "restore" like on mobile, so
// refreshing customer info for the current user is the web equivalent.
export async function restoreSproutPlusPurchases(): Promise<{ success: boolean; message?: string; status?: ReturnType<typeof buildSubscriptionStatus> }> {
  const customerInfo = await fetchCustomerInfo();
  const status = buildSubscriptionStatus(customerInfo);
  return status.hasSproutPlus
    ? { success: true, message: 'Sprout+ is active on this account.', status }
    : { success: true, message: 'No active Sprout+ subscription was found for this account.', status };
}

// The Web SDK has no push listener for entitlement changes, so the closest
// equivalent is re-checking whenever the tab regains focus (e.g. the user
// just finished managing billing in another tab). Async (returning a promise
// of an unsubscribe fn) purely to match the native implementation's shape,
// which genuinely needs to await the native bridge to register its listener.
export async function addCustomerInfoUpdateListener(callback: (status: ReturnType<typeof buildSubscriptionStatus>) => void): Promise<() => void> {
  const handleFocus = () => {
    fetchCustomerInfo()
      .then((customerInfo) => callback(buildSubscriptionStatus(customerInfo)))
      .catch((error) => console.error('Failed to refresh RevenueCat customer info', error));
  };
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}

/** True if `error` represents the user closing/cancelling the checkout, as opposed to a real failure. */
export function isUserCancelledError(error: unknown): boolean {
  return error instanceof PurchasesError && error.errorCode === ErrorCode.UserCancelledError;
}

/** A short, user-safe message for a purchase/offerings failure. Never echoes raw SDK/network internals. */
export function describePurchasesError(error: unknown): string {
  if (error instanceof PurchasesError) {
    switch (error.errorCode) {
      case ErrorCode.NetworkError:
        return 'Network issue — please check your connection and try again.';
      case ErrorCode.ProductAlreadyPurchasedError:
        return 'You already have an active Sprout+ subscription.';
      case ErrorCode.PaymentPendingError:
        return 'Your payment is still processing. This can take a moment to confirm.';
      case ErrorCode.StoreProblemError:
      case ErrorCode.UnknownBackendError:
      case ErrorCode.UnexpectedBackendResponseError:
        return 'Sprout+ checkout is temporarily unavailable. Please try again shortly.';
      default:
        return 'Something went wrong with your purchase. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}
