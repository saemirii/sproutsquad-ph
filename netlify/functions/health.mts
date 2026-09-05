import type { Config } from "@netlify/functions";

export default async () => {
  return Response.json({ status: "ok", app: "SproutSquad" });
};

export const config: Config = {
  path: "/api/health",
};
