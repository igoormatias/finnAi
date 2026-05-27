import type { CSSProperties } from "react";

export const CHART_COLORS = {
  primary: "#35e0a1",
  secondary: "#10b981",
  danger: "#fc7c78",
  muted: "#596579",
  grid: "rgba(89, 101, 121, 0.25)",
  tooltipBg: "rgba(18, 21, 28, 0.95)",
  palette: ["#35e0a1", "#34d399", "#6ee7b7", "#f59e0b", "#fc7c78", "#a78bfa"],
};

export const chartTooltipStyle: CSSProperties = {
  backgroundColor: CHART_COLORS.tooltipBg,
  border: "1px solid rgba(89, 101, 121, 0.4)",
  borderRadius: "12px",
  color: "#e7edf6",
  padding: "8px 12px",
  fontSize: "12px",
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
};

export const chartAnimationDuration = 700;
