import Link from "next/link";
import { LoginForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid w-full max-w-md gap-5 py-10">
      <div>
        <p className="label text-neon">Welcome back</p>
        <h1 className="mt-2 text-4xl font-black">Login</h1>
      </div>
      <LoginForm />
      <p className="text-sm text-slate-400">
        New here? <Link className="font-bold text-neon" href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
