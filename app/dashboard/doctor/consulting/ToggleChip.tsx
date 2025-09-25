export function ToggleChip({
  active,
  onClick,
  icon,
  children,
  activeClass = "bg-slate-800 text-white",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all " +
        (active
          ? `${activeClass} shadow`
          : "text-slate-600 hover:text-slate-800 hover:bg-white")
      }
    >
      {icon}
      {children}
    </button>
  );
}