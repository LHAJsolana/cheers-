import { NextRequest } from "next/server";
import { apiError, json, requireApiUser } from "@/lib/api-auth";
import { createDrinkFromApi } from "@/lib/api-services";

export async function POST(request: NextRequest) {
  const user = await requireApiUser(request);
  if (!user) return apiError("Unauthorized", 401);
  try {
    const drink = await createDrinkFromApi(user, await request.json());
    return json({ drink }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Could not log drink.");
  }
}
