import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { isAuthorizedWebhookRequest, processRevenueCatWebhookPayload } from "./server/revenuecatWebhook";
import { deleteAccount } from "./server/accountDeletion";
import { redeemPromoCode } from "./server/promoCode";

// This project's convention (matching Vite's own env loading) is `.env.local`
// for local secrets — there is no plain `.env` file. Plain `dotenv.config()`
// only looks for `.env` and would silently load nothing.
dotenv.config({ path: ".env.local" });

// This Express server is for LOCAL development and any non-Netlify deployment
// (e.g. Cloud Run, Render, Railway). The production Netlify deployment uses
// the equivalent Netlify Functions in netlify/functions/ instead — Netlify's
// standard hosting does not run a persistent Node server like this one. Both
// share their actual logic via server/revenuecatWebhook.ts so the two
// runtimes can't drift out of sync.
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Default express.json() body limit is 100kb — too small once a request
  // carries anything derived from this app's data (product/business images
  // are stored as base64 data URLs and can run into megabytes). Raised as a
  // defense-in-depth safety net.
  app.use(express.json({ limit: '5mb' }));

  // RevenueCat webhook — keeps a lightweight, queryable mirror of Sprout+
  // subscription status in Supabase. Never processes secrets client-side;
  // this route only runs in this Node process.
  app.post("/api/revenuecat-webhook", async (req, res) => {
    if (!isAuthorizedWebhookRequest(req.header("Authorization"))) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const result = await processRevenueCatWebhookPayload(req.body);
    return res.status(result.status).json(result.body);
  });

  // Account deletion (Apple Guideline 5.1.1(v)) — permanently removes the
  // requesting user's auth.users row; every other table cascades from there.
  app.post("/api/delete-account", async (req, res) => {
    const result = await deleteAccount(req.header("Authorization"));
    return res.status(result.status).json(result.body);
  });

  // Promo code redemption — grants a real RevenueCat promotional entitlement
  // (e.g. for hackathon judges) without a purchase. See server/promoCode.ts.
  app.post("/api/redeem-promo-code", async (req, res) => {
    const result = await redeemPromoCode(req.header("Authorization"), req.body?.code);
    return res.status(result.status).json(result.body);
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "SproutSquad" });
  });

  // Vite development middleware vs production static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌱 SproutSquad server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
