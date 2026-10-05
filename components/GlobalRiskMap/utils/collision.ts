import type { RiskOrigin } from "../types";

export interface PositionedOrigin extends RiskOrigin {
  x: number;
  y: number;
  radius: number;
  rank: number;
}

/**
 * Resolves marker overlap in projected map coordinates.
 *
 * Important: this runs before the SVG zoom transform. That means the same
 * collision result works for both flat maps and the globe and does not cause
 * layout jitter while the user zooms.
 */
export function resolveMarkerCollisions(
  markers: PositionedOrigin[],
  padding = 12
): PositionedOrigin[] {
  const result = markers.map((marker) => ({ ...marker }));

  for (let iteration = 0; iteration < 80; iteration++) {
    let changed = false;

    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];
        const b = result[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 0.001;
        const required = a.radius + b.radius + padding;

        if (distance < required) {
          const overlap = required - distance;
          const nx = dx / distance;
          const ny = dy / distance;
          const pushX = (nx * overlap) / 2;
          const pushY = (ny * overlap) / 2;

          a.x -= pushX;
          a.y -= pushY;
          b.x += pushX;
          b.y += pushY;
          changed = true;
        }
      }
    }

    if (!changed) break;
  }

  // Keep the final layout deterministic: the collision pass is intentionally
  // allowed to move points farther apart in very dense clusters so the
  // configured cushion is preserved instead of re-introducing overlap.

  return result;
}
