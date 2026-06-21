import { ReactionType } from "@prisma/client";
import { NextRequest } from "next/server";
import { apiError, json, requireApiUser } from "@/lib/api-auth";
import { toggleReaction } from "@/lib/api-services";

export async function POST(request: NextRequest, { params }: { params: Promise<{ activityId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return apiError("Unauthorized", 401);
  const body = await request.json();
  if (!Object.values(ReactionType).includes(body.type)) return apiError("Invalid reaction.");
  const { activityId } = await params;
  return json(await toggleReaction(user, activityId, body.type));
}
