import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createDrinkFromApi } from "@/lib/api-services";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return response({ error: "Unauthorized" }, 401);

  try {
    const formData = await request.formData();
    const input = {
      ...Object.fromEntries(formData),
      drinkPhotoUrl: await fileToDataUrl(formData.get("drinkPhoto")),
      placePhotoUrl: await fileToDataUrl(formData.get("placePhoto")),
    };

    const drink = await createDrinkFromApi(user, input);
    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath("/stats");
    return response({ drink }, 201);
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Could not log drink." }, 400);
  }
}

async function fileToDataUrl(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) return undefined;
  if (!value.type.startsWith("image/")) throw new Error("Use an image file.");
  if (value.size > 750_000) throw new Error("Keep photos under 750 KB for now.");

  const bytes = Buffer.from(await value.arrayBuffer());
  return `data:${value.type};base64,${bytes.toString("base64")}`;
}

function response(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
