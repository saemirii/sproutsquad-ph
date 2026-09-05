import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { getAiCoachAdvice } from "./server/aiCoach";
import { isAuthorizedWebhookRequest, processRevenueCatWebhookPayload } from "./server/revenuecatWebhook";

// This project's convention (matching Vite's own env loading) is `.env.local`
// for local secrets — there is no plain `.env` file. Plain `dotenv.config()`
// only looks for `.env` and would silently load nothing.
dotenv.config({ path: ".env.local" });

// This Express server is for LOCAL development and any non-Netlify deployment
// (e.g. Cloud Run, Render, Railway). The production Netlify deployment uses
// the equivalent Netlify Functions in netlify/functions/ instead — Netlify's
// standard hosting does not run a persistent Node server like this one. Both
// share their actual logic via server/aiCoach.ts and server/revenuecatWebhook.ts
// so the two runtimes can't drift out of sync.
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  // Optional Gemini AI Business Coach for Student Entrepreneurs
  app.post("/api/ai-coach", async (req, res) => {
    const result = await getAiCoachAdvice(req.body);
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
