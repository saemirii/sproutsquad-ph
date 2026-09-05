import type { Config } from "@netlify/functions";
import { isAuthorizedWebhookRequest, processRevenueCatWebhookPayload } from "../../server/revenuecatWebhook";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!isAuthorizedWebhookRequest(req.headers.get("Authorization"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await processRevenueCatWebhookPayload(payload);
  return Response.json(result.body, { status: result.status });
};

export const config: Config = {
  path: "/api/revenuecat-webhook",
};
