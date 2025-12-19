import type { AIStatus } from "@/types";

interface AIStatusBadgeProps {
  status: AIStatus;
}

const statusConfig: Record<AIStatus, { label: string; className: string; icon: string }> = {
  pending: {
    label: "AI Analysis Pending",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: "⏳",
  },
  processing: {
    label: "AI Analyzing...",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "🤖",
  },
  success: {
    label: "AI Insights Ready",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: "✨",
  },
  failed: {
    label: "AI Analysis Failed",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: "⚠️",
  },
};

export function AIStatusBadge({ status }: AIStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

