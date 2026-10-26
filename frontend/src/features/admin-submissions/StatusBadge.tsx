export type BadgeTone = "neutral" | "success" | "warning";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-tone-neutral-bg text-tone-neutral-fg border-tone-neutral-border",
  success: "bg-tone-success-bg text-tone-success-fg border-tone-success-border",
  warning: "bg-tone-warning-bg text-tone-warning-fg border-tone-warning-border",
};

type StatusBadgeProps = {
  label: string;
  tone: BadgeTone;
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
