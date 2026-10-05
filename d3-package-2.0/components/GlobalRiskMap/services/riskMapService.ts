import type { RiskMapResponse } from "../types";

export interface RiskMapQuery {
  region?: string;
  riskLevel?: string;
  from?: string;
  to?: string;
}

export async function fetchRiskMap(
  query: RiskMapQuery = {},
  signal?: AbortSignal
): Promise<RiskMapResponse> {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const queryString = params.toString();
  const url = `/api/v1/risk-map${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Risk map request failed: ${response.status}`);
  }

  return response.json() as Promise<RiskMapResponse>;
}
