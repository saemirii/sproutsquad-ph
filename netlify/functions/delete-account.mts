import type { Config } from "@netlify/functions";
import { deleteAccount } from "../../server/accountDeletion";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const result = await deleteAccount(req.headers.get("Authorization"));
  return Response.json(result.body, { status: result.status });
};

export const config: Config = {
  path: "/api/delete-account",
};
