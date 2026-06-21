import { NextRequest } from "next/server";
import { apiError, json, requireApiUser } from "@/lib/api-auth";
import { getStatsPayload } from "@/lib/api-services";

export async function GET(request: NextRequest) {
  const user = await requireApiUser(request);
  if (!user) return apiError("Unauthorized", 401);
  return json(await getStatsPayload(user));
}
