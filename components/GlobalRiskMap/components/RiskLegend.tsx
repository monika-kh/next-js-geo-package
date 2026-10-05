import { RISK_COLORS, RISK_LABELS } from "../utils/risk";
import type { RiskLevel } from "../types";

export function RiskLegend() {
  return (
    <div className="legend">
      <div className="legend-title">Country Risk</div>
      {(Object.keys(RISK_COLORS) as RiskLevel[]).map((risk) => (
        <div className="legend-item" key={risk}>
          <span
            className="legend-color"
            style={{ background: RISK_COLORS[risk] }}
          />
          <span>{RISK_LABELS[risk]}</span>
        </div>
      ))}
    </div>
  );
}
