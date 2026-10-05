import type { GeoPath, GeoPermissibleObjects } from "d3-geo";
import type { Feature } from "geojson";
import type { RiskCountry } from "../types";
import { RISK_COLORS } from "../utils/risk";

export function CountryLayer({
  countries,
  countryRisk,
  pathGenerator,
}: {
  countries: Feature[];
  countryRisk: Map<string, RiskCountry>;
  pathGenerator: GeoPath<any, GeoPermissibleObjects>;
}) {
  return (
    <g>
      {countries.map((country, index) => {
        const id = country.id != null ? String(country.id) : `country-${index}`;
        const risk = countryRisk.get(id);

        return (
          <path
            key={id}
            d={pathGenerator(country) || ""}
            className="country"
            fill={risk ? RISK_COLORS[risk.risk] : "#EEF2F6"}
          />
        );
      })}
    </g>
  );
}
