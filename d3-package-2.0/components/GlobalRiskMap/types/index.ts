export type RiskLevel = "low" | "medium" | "high" | "critical";

export type MapLayout = "natural-earth" | "equal-earth" | "mercator" | "globe";

export interface RiskCountry {
  isoNumeric: string;
  isoAlpha2: string;
  name: string;
  risk: RiskLevel;
}

export interface RiskOrigin {
  id: string;
  label: string;
  countryIsoAlpha2: string;
  latitude: number;
  longitude: number;
  risk: RiskLevel;
  value: number;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface RiskMapResponse {
  version: string;
  generatedAt: string;
  countries: RiskCountry[];
  origins: RiskOrigin[];
}

export interface GlobalRiskMapProps {
  data: RiskMapResponse;
  defaultLayout?: MapLayout;
  className?: string;
}
