// Shared between the web (`revenuecat.web.ts`) and native (`revenuecat.native.ts`)
// RevenueCat implementations — hoisted here so neither platform file duplicates
// this logic, and so `revenuecat.ts` (the dispatcher) can re-export it without
// pulling in either SDK.

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
  /** 'active' = paid and renewing. 'cancelling' = paid access still active, but won't renew. 'promotional' = a free grant (e.g. a redeemed promo code) with no renewal to speak of. 'inactive' = no access. */
  status: 'active' | 'cancelling' | 'promotional' | 'inactive';
  /** True when this entitlement came from a promotional grant (e.g. redeemPromoCode), not a real store purchase — willRenew is naturally false for these, which would otherwise be indistinguishable from an actually-cancelled paid subscription. */
  isPromotional: boolean;
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
  isPromotional: false,
  purchaseDate: null,
  expirationDate: null,
  willRenew: false,
  managementURL: null,
  isSandbox: false,
};

// The web (`@revenuecat/purchases-js`) and native (`@revenuecat/purchases-capacitor`)
// SDKs expose the same entitlement fields, with two real divergences confirmed
// against both packages' own type declarations: web types latestPurchaseDate/
// expirationDate as `Date`, native types them as ISO 8601 `string`; web's
// `store` literal is lowercase ("promotional"), native's is uppercase
// ("PROMOTIONAL"). This minimal shape captures only what's read below, with
// both loosely typed to accept either, so this one function serves both
// platforms.
interface MinimalEntitlementInfo {
  isActive: boolean;
  productIdentifier: string;
  latestPurchaseDate: string | Date;
  expirationDate: string | Date | null;
  willRenew: boolean;
  isSandbox: boolean;
  store: string;
}

interface MinimalCustomerInfo {
  entitlements: { active: Record<string, MinimalEntitlementInfo> };
  managementURL: string | null;
}

function toDateOrNull(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

export function buildSubscriptionStatus(customerInfo: MinimalCustomerInfo | null): SproutPlusStatus {
  if (!customerInfo) return DEFAULT_SUBSCRIPTION_STATUS;

  const entitlement = customerInfo.entitlements.active[SPROUT_PLUS_ENTITLEMENT];
  if (!entitlement) return { ...DEFAULT_SUBSCRIPTION_STATUS, managementURL: customerInfo.managementURL };

  const isPromotional = entitlement.store?.toUpperCase() === 'PROMOTIONAL';

  return {
    hasSproutPlus: entitlement.isActive,
    productIdentifier: entitlement.productIdentifier,
    status: !entitlement.isActive ? 'inactive' : isPromotional ? 'promotional' : entitlement.willRenew ? 'active' : 'cancelling',
    isPromotional,
    purchaseDate: toDateOrNull(entitlement.latestPurchaseDate),
    expirationDate: toDateOrNull(entitlement.expirationDate),
    willRenew: entitlement.willRenew,
    managementURL: customerInfo.managementURL,
    isSandbox: entitlement.isSandbox,
  };
}
