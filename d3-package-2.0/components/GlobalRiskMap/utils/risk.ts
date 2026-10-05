import type { RiskLevel } from "../types";

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#C9F58A",
  medium: "#FFE28A",
  high: "#FFB36B",
  critical: "#FF6868",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};
