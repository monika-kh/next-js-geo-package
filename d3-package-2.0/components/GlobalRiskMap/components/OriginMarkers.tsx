import type { MouseEvent as ReactMouseEvent } from "react";
import type { RiskOrigin } from "../types";
import type { PositionedOrigin } from "../utils/collision";
import { RISK_COLORS } from "../utils/risk";

interface OriginMarkersProps {
  origins: PositionedOrigin[];
  selectedId?: string | null;
  onHover: (
    origin: RiskOrigin | null,
    point: { x: number; y: number } | null
  ) => void;
  onSelect: (
    origin: RiskOrigin | null,
    point: { x: number; y: number } | null
  ) => void;
}

/**
 * Renders business-origin markers on top of the country layer.
 *
 * The visible marker is deliberately wrapped with a larger transparent
 * interaction/cushion ring. This gives dense points enough breathing room
 * and makes the hit target easier to use without making the core dot larger.
 */
export function OriginMarkers({
  origins,
  selectedId,
  onHover,
  onSelect,
}: OriginMarkersProps) {
  const handleClick = (
    event: ReactMouseEvent<SVGGElement>,
    origin: PositionedOrigin
  ) => {
    event.stopPropagation();
    const point = { x: origin.x, y: origin.y };
    onSelect(selectedId === origin.id ? null : origin, point);
  };

  return (
    <g className="origin-markers">
      {origins.map((origin, index) => {
        const isSelected = selectedId === origin.id;

        return (
          <g
            key={origin.id || `origin-${index}`}
            transform={`translate(${origin.x}, ${origin.y})`}
            className={`origin-marker${isSelected ? " is-selected" : ""}`}
            onMouseEnter={() => onHover(origin, { x: origin.x, y: origin.y })}
            onMouseLeave={() => onHover(null, null)}
            onClick={(event) => handleClick(event, origin)}
            aria-label={`${origin.label}, risk ${origin.risk}`}
            role="button"
          >
            {/* Large hit/cushion area. */}
            <circle
              r={origin.radius + 11}
              className="marker-cushion"
              fill={RISK_COLORS[origin.risk]}
            />
            <circle r={origin.radius + 5} className="marker-white-ring" />
            <circle
              r={origin.radius}
              className="marker"
              fill={RISK_COLORS[origin.risk]}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              className="marker-number"
            >
              {origin.rank}
            </text>
          </g>
        );
      })}
    </g>
  );
}
