import { GlobalRiskMap } from "@/components/GlobalRiskMap";
import { demoRiskMapData } from "@/components/GlobalRiskMap/data/demoRiskMapData";

export default function Home() {
  return <GlobalRiskMap data={demoRiskMapData} />;
}
