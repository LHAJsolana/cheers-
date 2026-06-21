import { logoutAction } from "@/app/actions";
import { BottomNav } from "@/components/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="grid gap-4">{children}</main>
      <BottomNav />
      <form action={logoutAction} className="fixed right-4 top-16 z-40">
        <button className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-200 backdrop-blur hover:bg-white/15">
          Logout
        </button>
      </form>
    </>
  );
}
