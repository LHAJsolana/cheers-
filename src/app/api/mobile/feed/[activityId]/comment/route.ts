import { NextRequest } from "next/server";
import { apiError, json, requireApiUser } from "@/lib/api-auth";
import { isPresetComment } from "@/lib/comment-presets";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ activityId: string }> }) {
  const user = await requireApiUser(request);
  if (!user) return apiError("Unauthorized", 401);
  const body = await request.json();
  if (typeof body.text !== "string" || !isPresetComment(body.text)) return apiError("Pick a preset reply.");

  const { activityId } = await params;
  await prisma.comment.create({
    data: {
      userId: user.id,
      activityId,
      text: body.text,
    },
  });

  return json({ ok: true }, 201);
}
