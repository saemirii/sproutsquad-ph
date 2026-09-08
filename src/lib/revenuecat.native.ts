import {
  Purchases,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
  type MakePurchaseResult,
} from '@revenuecat/purchases-capacitor';
import { buildSubscriptionStatus, type SproutPlusStatus } from './revenuecatConstants';

// Native (StoreKit-backed, via RevenueCat's Capacitor SDK) implementation.
// Only ever imported dynamically by `revenuecat.ts` (the platform dispatcher)
// when running as a native iOS app — never import
// '@revenuecat/purchases-capacitor' from anywhere else.
//
// Every SDK call here is async (even isConfigured/isAnonymous/getAppUserID —
// unlike the web SDK's synchronous instance methods), since Capacitor bridges
// every plugin call over a native message channel. Verified directly against
// this project's installed @revenuecat/purchases-capacitor version's own
// .d.ts files and Swift plugin source, not assumed from the web SDK's shape.

const REVENUECAT_IOS_PUBLIC_KEY = import.meta.env.VITE_REVENUECAT_IOS_PUBLIC_KEY as string | undefined;

export const isConfigured = Boolean(REVENUECAT_IOS_PUBLIC_KEY);

export async function identifyRevenueCatUser(appUserId: string): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;

  const { isConfigured: alreadyConfigured } = await Purchases.isConfigured();
  if (!alreadyConfigured) {
    await Purchases.configure({ apiKey: REVENUECAT_IOS_PUBLIC_KEY as string, appUserID: appUserId });
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  }

  const { appUserID: currentAppUserId } = await Purchases.getAppUserID();
  if (currentAppUserId === appUserId) {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  }
  const { customerInfo } = await Purchases.logIn({ appUserID: appUserId });
  return customerInfo;
}

/**
 * Resets RevenueCat back to a fresh anonymous identity on sign-out, so the
 * next person to use this device never inherits the previous user's
 * entitlements. logOut() throws LOG_OUT_ANONYMOUS_USER_ERROR if the current
 * user is already anonymous, so that case is checked and skipped first,
 * mirroring the web implementation's guard.
 */
export async function resetRevenueCatUser(): Promise<void> {
  if (!isConfigured) return;
  const { isConfigured: alreadyConfigured } = await Purchases.isConfigured();
  if (!alreadyConfigured) return;
  const { isAnonymous } = await Purchases.isAnonymous();
  if (isAnonymous) return;
  await Purchases.logOut();
}

export async function fetchSproutPlusOfferings(): Promise<PurchasesOfferings> {
  if (!isConfigured) throw new Error('RevenueCat is not configured. Set VITE_REVENUECAT_IOS_PUBLIC_KEY.');
  return Purchases.getOfferings();
}

export async function purchaseSproutPlus(pkg: PurchasesPackage): Promise<MakePurchaseResult> {
  if (!isConfigured) throw new Error('RevenueCat is not configured. Set VITE_REVENUECAT_IOS_PUBLIC_KEY.');
  return Purchases.purchasePackage({ aPackage: pkg });
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  const { isConfigured: alreadyConfigured } = await Purchases.isConfigured();
  if (!alreadyConfigured) return null;
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo;
}

// Real StoreKit receipt restore — unlike the web checkout, a purchase made
// under a different app-user-id (e.g. a reinstall) genuinely needs this to
// recover access, rather than just re-fetching the currently-identified
// user's customer info.
export async function restoreSproutPlusPurchases(): Promise<{ success: boolean; message?: string; status?: SproutPlusStatus }> {
  const { customerInfo } = await Purchases.restorePurchases();
  const status = buildSubscriptionStatus(customerInfo);
  return status.hasSproutPlus
    ? { success: true, message: 'Sprout+ is active on this account.', status }
    : { success: true, message: 'No active Sprout+ subscription was found for this account.', status };
}

// Real push listener for entitlement changes (fires on renewals, billing
// issues resolved, restores, etc.) — no focus-polling needed on native.
export async function addCustomerInfoUpdateListener(callback: (status: SproutPlusStatus) => void): Promise<() => void> {
  const listenerId = await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
    callback(buildSubscriptionStatus(customerInfo));
  });
  return () => {
    void Purchases.removeCustomerInfoUpdateListener({ listenerToRemove: listenerId });
  };
}

function getErrorCode(error: unknown): PURCHASES_ERROR_CODE | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as { code: string }).code as PURCHASES_ERROR_CODE;
  }
  return null;
}

/** True if `error` represents the user closing/cancelling the checkout, as opposed to a real failure. */
export function isUserCancelledError(error: unknown): boolean {
  return getErrorCode(error) === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}

/** A short, user-safe message for a purchase/offerings failure. Never echoes raw SDK/network internals. */
export function describePurchasesError(error: unknown): string {
  switch (getErrorCode(error)) {
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return 'Network issue — please check your connection and try again.';
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
      return 'You already have an active Sprout+ subscription.';
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return 'Your payment is still processing. This can take a moment to confirm.';
    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
    case PURCHASES_ERROR_CODE.UNKNOWN_BACKEND_ERROR:
    case PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR:
      return 'Sprout+ checkout is temporarily unavailable. Please try again shortly.';
    default:
      return 'Something went wrong with your purchase. Please try again.';
  }
}
