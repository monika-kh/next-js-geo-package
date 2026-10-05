import type { RiskOrigin } from "../types";
import { RISK_LABELS } from "../utils/risk";

export function OriginTooltip({
  origin,
  left,
  top,
  placement = "top",
}: {
  origin: RiskOrigin;
  left: number;
  top: number;
  placement?: "top" | "bottom";
}) {
  return (
    <div
      className={`tooltip-overlay tooltip-${placement}`}
      style={{ left, top }}
      role="tooltip"
    >
      <div className="tooltip-title">{origin.label}</div>
      <div className="tooltip-row">{origin.countryIsoAlpha2}</div>
      <div className="tooltip-row">Risk: {RISK_LABELS[origin.risk]}</div>
      <div className="tooltip-row">Exposure: {origin.value}</div>
    </div>
  );
}
