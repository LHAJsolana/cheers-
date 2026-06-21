export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}
