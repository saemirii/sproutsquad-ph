import {
  Purchases,
  PurchasesError,
  ErrorCode,
  type CustomerInfo,
  type Offerings,
  type Package,
  type PurchaseResult,
} from '@revenuecat/purchases-js';

// Single abstraction point for the RevenueCat Web SDK. Nothing outside this
// file should import from '@revenuecat/purchases-js' directly (except for
// types), so the SDK can be swapped/upgraded without touching UI code.

const REVENUECAT_PUBLIC_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY as string | undefined;

export const isRevenueCatConfigured = Boolean(REVENUECAT_PUBLIC_KEY);

// Both sprout_plus_monthly and sprout_plus_yearly grant this single entitlement.
// Feature access must always be checked against the entitlement, never the product id.
// NOTE: this must exactly match the entitlement identifier configured in the
// RevenueCat dashboard (Project > Entitlements) — a mismatch here means every
// purchase event gets silently skipped as "unrelated entitlement" even though
// a real purchase succeeded. Confirmed live against the dashboard's actual
// configured name.
export const SPROUT_PLUS_ENTITLEMENT = 'sproutsquad_membership';

export const SPROUT_PLUS_PRODUCTS = {
  monthly: 'sprout_plus_monthly',
  yearly: 'sprout_plus_yearly',
} as const;

export interface SproutPlusStatus {
  hasSproutPlus: boolean;
  productIdentifier: string | null;
  /** 'active' = paid and renewing. 'cancelling' = paid access still active, but won't renew. 'inactive' = no access. */
  status: 'active' | 'cancelling' | 'inactive';
  purchaseDate: Date | null;
  expirationDate: Date | null;
  willRenew: boolean;
  managementURL: string | null;
  isSandbox: boolean;
}

export const DEFAULT_SUBSCRIPTION_STATUS: SproutPlusStatus = {
  hasSproutPlus: false,
  productIdentifier: null,
  status: 'inactive',
  purchaseDate: null,
  expirationDate: null,
  willRenew: false,
  managementURL: null,
  isSandbox: false,
};

export function buildSubscriptionStatus(customerInfo: CustomerInfo | null): SproutPlusStatus {
  if (!customerInfo) return DEFAULT_SUBSCRIPTION_STATUS;

  const entitlement = customerInfo.entitlements.active[SPROUT_PLUS_ENTITLEMENT];
  if (!entitlement) return { ...DEFAULT_SUBSCRIPTION_STATUS, managementURL: customerInfo.managementURL };

  return {
    hasSproutPlus: entitlement.isActive,
    productIdentifier: entitlement.productIdentifier,
    status: !entitlement.isActive ? 'inactive' : entitlement.willRenew ? 'active' : 'cancelling',
    purchaseDate: entitlement.latestPurchaseDate,
    expirationDate: entitlement.expirationDate,
    willRenew: entitlement.willRenew,
    managementURL: customerInfo.managementURL,
    isSandbox: entitlement.isSandbox,
  };
}

function getConfiguredInstance(): Purchases | null {
  if (!isRevenueCatConfigured) return null;
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
  if (!isRevenueCatConfigured) return null;

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
