import type { Config } from "@netlify/functions";
import { redeemPromoCode } from "../../server/promoCode";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await req.json().catch(() => ({}) as { code?: string });
  const result = await redeemPromoCode(req.headers.get("Authorization"), body?.code);
  return Response.json(result.body, { status: result.status });
};

export const config: Config = {
  path: "/api/redeem-promo-code",
};
