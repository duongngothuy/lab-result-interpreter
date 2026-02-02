"use client";

interface StatusBadgeProps {
  status: "normal" | "abnormal" | "critical";
}

const config = {
  normal: {
    label: "Normal",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  abnormal: {
    label: "Abnormal",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
