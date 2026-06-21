import { AppShell } from "@/components/app-shell";
import { DrinkForm } from "@/components/drink-form";
import { requireUser } from "@/lib/auth";

export default async function LogDrinkPage() {
  const user = await requireUser();
  return (
    <AppShell>
      <section>
        <p className="label text-neon">Log drink</p>
        <h1 className="mt-2 text-3xl font-black">Add the receipt to your memory bank</h1>
        <p className="mt-2 text-sm text-slate-400">Estimates update after saving. Cheers never treats BAC as legal or medical advice.</p>
      </section>
      <DrinkForm defaultVisibility={user.privacyDefault} />
    </AppShell>
  );
}
