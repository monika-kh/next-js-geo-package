"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { WheelEvent as ReactWheelEvent } from "react";
import { geoDistance, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";

import type { GlobalRiskMapProps, RiskOrigin, MapLayout } from "./types";
import {
  createProjection,
  GLOBE_RADIUS,
  MAP_HEIGHT,
  MAP_WIDTH,
} from "./utils/projection";
import {
  resolveMarkerCollisions,
  type PositionedOrigin,
} from "./utils/collision";
import { useMapInteraction } from "./hooks/useMapInteraction";
import { CountryLayer } from "./components/CountryLayer";
import { OriginMarkers } from "./components/OriginMarkers";
import { OriginTooltip } from "./components/OriginTooltip";
import { LayoutSwitcher } from "./components/LayoutSwitcher";
import { RiskLegend } from "./components/RiskLegend";
import { MapControls } from "./components/MapControls";

const TOOLTIP_WIDTH = 210;
const TOOLTIP_HEIGHT = 92;
const TOOLTIP_GAP = 14;

export function GlobalRiskMap({
  data,
  defaultLayout = "natural-earth",
}: GlobalRiskMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapCardRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [layout, setLayout] = useState<MapLayout>(defaultLayout);
  const [hovered, setHovered] = useState<RiskOrigin | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selected, setSelected] = useState<RiskOrigin | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [resizeTick, setResizeTick] = useState(0);

  const {
    rotation,
    transform,
    setTransform,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    reset,
  } = useMapInteraction(layout);

  // Tooltip is HTML, so it needs a resize re-render to stay correctly aligned
  // when the responsive SVG changes size.
  useEffect(() => {
    const handleResize = () => setResizeTick((value) => value + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const projection = useMemo(
    () => createProjection(layout, rotation),
    [layout, rotation]
  );

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const countries = useMemo(() => {
    const geo = feature(world as any, world.objects.countries as any) as any;
    return geo.features;
  }, []);

  const countryRisk = useMemo(
    () =>
      new Map(data.countries.map((country) => [country.isoNumeric, country])),
    [data.countries]
  );

  const positionedOrigins = useMemo<PositionedOrigin[]>(() => {
    const projected = data.origins.flatMap((origin, originIndex) => {
      // Orthographic projections can mathematically project points on the
      // far side of the globe. Hide those points just like a globe map would.
      if (layout === "globe") {
        const globeCenter: [number, number] = [-rotation[0], -rotation[1]];
        const angularDistance = geoDistance(
          [origin.longitude, origin.latitude],
          globeCenter
        );
        if (angularDistance > Math.PI / 2) return [];
      }

      const point = projection([origin.longitude, origin.latitude]);
      if (!point) return [];

      return [
        {
          ...origin,
          x: point[0],
          y: point[1],
          radius: 10 + origin.value / 13,
          rank: originIndex + 1,
        },
      ];
    });

    return resolveMarkerCollisions(projected, 12);
  }, [data.origins, projection]);

  const initializeZoom = (node: SVGSVGElement) => {
    if (!zoomRef.current) {
      const behavior = zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.8, 4])
        .on("zoom", (event) =>
          setTransform({
            x: event.transform.x,
            y: event.transform.y,
            k: event.transform.k,
          })
        );

      zoomRef.current = behavior;
    }

    select(node).call(zoomRef.current);
  };

  const detachFlatZoom = () => {
    if (svgRef.current) {
      select(svgRef.current).on(".zoom", null);
    }
  };

  const resetMap = () => {
    reset();
    setHovered(null);
    setHoveredPoint(null);
    setSelected(null);
    setSelectedPoint(null);

    // D3 keeps its own transform state, so resetting React state alone is not
    // enough for flat maps. Keep both sources of truth synchronized.
    if (svgRef.current && zoomRef.current && layout !== "globe") {
      select(svgRef.current)
        .transition()
        .duration(240)
        .call(zoomRef.current.transform, zoomIdentity);
    }
  };

  const changeLayout = (next: MapLayout) => {
    setLayout(next);
    setHovered(null);
    setHoveredPoint(null);
    setSelected(null);
    setSelectedPoint(null);
    reset();

    if (svgRef.current && zoomRef.current) {
      if (next === "globe") {
        detachFlatZoom();
      } else {
        select(svgRef.current).call(zoomRef.current);
        select(svgRef.current).call(zoomRef.current.transform, zoomIdentity);
      }
    }
  };

  const zoomIn = () => {
    if (layout === "globe") {
      setTransform((current) => {
        const nextK = Math.min(current.k * 1.2, 2.2);

        const centerX = MAP_WIDTH / 2;
        const centerY = MAP_HEIGHT / 2;

        return {
          k: nextK,
          x: centerX - (centerX - current.x) * (nextK / current.k),
          y: centerY - (centerY - current.y) * (nextK / current.k),
        };
      });

      return;
    }

    if (svgRef.current && zoomRef.current) {
      select(svgRef.current)
        .transition()
        .duration(180)
        .call(zoomRef.current.scaleBy, 1.2);
    }
  };

  const zoomOut = () => {
    if (layout === "globe") {
      setTransform((current) => {
        const nextK = Math.max(current.k / 1.2, 0.7);

        const centerX = MAP_WIDTH / 2;
        const centerY = MAP_HEIGHT / 2;

        return {
          k: nextK,
          x: centerX - (centerX - current.x) * (nextK / current.k),
          y: centerY - (centerY - current.y) * (nextK / current.k),
        };
      });

      return;
    }

    if (svgRef.current && zoomRef.current) {
      select(svgRef.current)
        .transition()
        .duration(180)
        .call(zoomRef.current.scaleBy, 0.83);
    }
  };
  const handleHover = (
    origin: RiskOrigin | null,
    point: { x: number; y: number } | null
  ) => {
    setHovered(origin);
    setHoveredPoint(point);
  };

  const handleSelect = (
    origin: RiskOrigin | null,
    point: { x: number; y: number } | null
  ) => {
    setSelected(origin);
    setSelectedPoint(point);
  };

  const handleMapClick = () => {
    setSelected(null);
    setSelectedPoint(null);
  };

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    if (layout !== "globe") return;

    event.preventDefault();

    const factor = event.deltaY < 0 ? 1.08 : 0.93;

    setTransform((current) => {
      const nextK = Math.max(0.7, Math.min(2.2, current.k * factor));

      const centerX = MAP_WIDTH / 2;
      const centerY = MAP_HEIGHT / 2;

      return {
        k: nextK,
        x: centerX - (centerX - current.x) * (nextK / current.k),
        y: centerY - (centerY - current.y) * (nextK / current.k),
      };
    });
  };

  const activeOrigin = hovered ?? selected;
  const activePositionedOrigin = activeOrigin
    ? positionedOrigins.find((origin) => origin.id === activeOrigin.id)
    : null;
  // Prefer the latest projected/collision-resolved coordinates. This keeps a
  // pinned tooltip attached to its marker while the globe is rotating.
  const activePoint = activePositionedOrigin
    ? { x: activePositionedOrigin.x, y: activePositionedOrigin.y }
    : hoveredPoint ?? selectedPoint;
  const isGlobe = layout === "globe";

  // Convert the fixed SVG viewBox coordinates into CSS pixels. Without this,
  // tooltip positions drift when the map card is resized responsively.
  const tooltipPosition = useMemo(() => {
    if (!activePoint || !svgRef.current || !mapCardRef.current) return null;

    const svgRect = svgRef.current.getBoundingClientRect();
    const cardRect = mapCardRef.current.getBoundingClientRect();
    const scaleX = svgRect.width / MAP_WIDTH;
    const scaleY = svgRect.height / MAP_HEIGHT;

    const viewBoxX = activePoint.x * transform.k + transform.x;
    const viewBoxY = activePoint.y * transform.k + transform.y;
    const anchorX = svgRect.left - cardRect.left + viewBoxX * scaleX;
    const anchorY = svgRect.top - cardRect.top + viewBoxY * scaleY;

    const useBottomPlacement = anchorY < TOOLTIP_HEIGHT + TOOLTIP_GAP;
    const unclampedLeft = anchorX + TOOLTIP_GAP;
    const unclampedTop = useBottomPlacement
      ? anchorY + TOOLTIP_GAP
      : anchorY - TOOLTIP_HEIGHT - TOOLTIP_GAP;

    const left = Math.max(
      8,
      Math.min(unclampedLeft, cardRect.width - TOOLTIP_WIDTH - 8)
    );
    const top = Math.max(
      8,
      Math.min(unclampedTop, cardRect.height - TOOLTIP_HEIGHT - 8)
    );

    return {
      left,
      top,
      placement: useBottomPlacement ? ("bottom" as const) : ("top" as const),
    };
  }, [activePoint, transform, layout, resizeTick, positionedOrigins]);

  return (
    <div
      ref={mapCardRef}
      className={`map-card${isDragging ? " is-dragging" : ""}`}
      onClick={handleMapClick}
    >
      <LayoutSwitcher value={layout} onChange={changeLayout} />

      <svg
        ref={(node) => {
          svgRef.current = node;
          if (node) {
            if (isGlobe) {
              detachFlatZoom();
            } else {
              initializeZoom(node);
            }
          }
        }}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="map"
        onPointerDown={isGlobe ? onPointerDown : undefined}
        onPointerMove={isGlobe ? onPointerMove : undefined}
        onPointerUp={isGlobe ? onPointerUp : undefined}
        onPointerLeave={isGlobe ? onPointerUp : undefined}
        onWheel={isGlobe ? handleWheel : undefined}
        onClick={(event) => {
          // Let the marker's stopPropagation() prevent this from clearing a
          // selection when a marker is clicked.
          if (event.target === event.currentTarget) handleMapClick();
        }}
        aria-label="Global risk map"
      >
        <defs>
          <clipPath id="globe-clip">
            <circle cx={MAP_WIDTH / 2} cy={MAP_HEIGHT / 2} r={GLOBE_RADIUS} />
          </clipPath>
          <radialGradient id="globe-gradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e8edf3" />
          </radialGradient>
        </defs>

        <rect
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="map-background"
        />

        {/* Sphere + countries + markers share one transform. This is what
            keeps the globe background visually attached to the map. */}
        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
        >
          {isGlobe && (
            <circle
              cx={MAP_WIDTH / 2}
              cy={MAP_HEIGHT / 2}
              r={GLOBE_RADIUS}
              className="globe-sphere"
            />
          )}

          <g clipPath={isGlobe ? "url(#globe-clip)" : undefined}>
            <CountryLayer
              countries={countries}
              countryRisk={countryRisk}
              pathGenerator={pathGenerator}
            />
            <OriginMarkers
              origins={positionedOrigins}
              selectedId={selected?.id}
              onHover={handleHover}
              onSelect={handleSelect}
            />
          </g>
        </g>
      </svg>

      {activeOrigin && tooltipPosition && (
        <OriginTooltip
          origin={activeOrigin}
          left={tooltipPosition.left}
          top={tooltipPosition.top}
          placement={tooltipPosition.placement}
        />
      )}

      <RiskLegend />
      <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetMap} />

      {isGlobe && (
        <div className="globe-hint">Drag to rotate · + / − to zoom</div>
      )}
    </div>
  );
}
