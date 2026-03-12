import { cn } from "@/lib/utils";

type ChipProps = {
  active: boolean;
  onClick: () => void;
  label: string;
};

export function Chip({ active, onClick, label }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-3 text-sm transition",
        active
          ? "border-accent bg-accent text-white"
          : "border-line bg-white text-ink"
      )}
    >
      {label}
    </button>
  );
}
