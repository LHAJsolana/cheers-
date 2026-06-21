import Link from "next/link";
import { SignupForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="mx-auto grid w-full max-w-md gap-5 py-10">
      <div>
        <p className="label text-neon">Create account</p>
        <h1 className="mt-2 text-4xl font-black">Start tracking</h1>
      </div>
      <SignupForm />
      <p className="text-sm text-slate-400">
        Already have an account? <Link className="font-bold text-neon" href="/login">Login</Link>
      </p>
    </main>
  );
}
