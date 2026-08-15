export function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 text-center flex flex-col justify-center shadow-sm border border-slate-700/50">
      <p className="m-0 text-[11px] text-slate-400 uppercase tracking-widest font-medium">
        {label}
      </p>
      <p
        className="mt-2 mb-0 text-3xl font-extrabold"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}
