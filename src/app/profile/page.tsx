import { ProfileForm } from "@/components/profile-form";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <AppShell>
      <section>
        <p className="label text-neon">Profile</p>
        <h1 className="mt-2 text-3xl font-black">@{user.username}</h1>
        <p className="mt-2 text-sm text-slate-400">Tune privacy, goals, and notification energy.</p>
      </section>
      <ProfileForm user={user} />
    </AppShell>
  );
}
