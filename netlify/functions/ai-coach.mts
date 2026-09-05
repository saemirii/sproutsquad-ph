import type { Config } from "@netlify/functions";
import { getAiCoachAdvice } from "../../server/aiCoach";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await getAiCoachAdvice(payload as Parameters<typeof getAiCoachAdvice>[0]);
  return Response.json(result.body, { status: result.status });
};

export const config: Config = {
  path: "/api/ai-coach",
};
