import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingCompleted) redirect("/dashboard");

  return (
    <main className="mx-auto grid w-full max-w-md gap-5 py-6">
      <OnboardingForm username={user.username} weightKg={user.weightKg} />
    </main>
  );
}
