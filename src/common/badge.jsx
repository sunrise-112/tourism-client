export default ({ active, trueLabel = "Yes", falseLabel = "No" }) => (
  <span
    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-stone-50 text-stone-400 border-stone-200"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        active ? "bg-emerald-400" : "bg-stone-300"
      }`}
    />
    {active ? trueLabel : falseLabel}
  </span>
);
