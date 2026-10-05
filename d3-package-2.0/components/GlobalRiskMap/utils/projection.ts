import {
  geoEqualEarth,
  geoMercator,
  geoNaturalEarth1,
  geoOrthographic,
  type GeoProjection,
} from "d3-geo";
import type { MapLayout } from "../types";

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 560;
export const GLOBE_RADIUS = 220;

export function createProjection(
  layout: MapLayout,
  rotation: [number, number, number]
): GeoProjection {
  switch (layout) {
    case "equal-earth":
      return geoEqualEarth()
        .scale(165)
        .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2 + 15]);
    case "mercator":
      return geoMercator()
        .scale(145)
        .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2 + 15]);
    case "globe":
      return geoOrthographic()
        .scale(GLOBE_RADIUS)
        .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
        .rotate(rotation);
    default:
      return geoNaturalEarth1()
        .scale(165)
        .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2 + 15]);
  }
}
