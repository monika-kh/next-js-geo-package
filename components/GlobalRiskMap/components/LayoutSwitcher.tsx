import type { MapLayout } from "../types";

const layouts: { id: MapLayout; label: string }[] = [
  { id: "natural-earth", label: "Natural Earth" },
  { id: "equal-earth", label: "Equal Earth" },
  { id: "mercator", label: "Mercator" },
  { id: "globe", label: "Globe" },
];

export function LayoutSwitcher({
  value,
  onChange,
}: {
  value: MapLayout;
  onChange: (value: MapLayout) => void;
}) {
  return (
    <div className="layout-switcher">
      <div className="layout-label">Map Layout</div>
      <div className="layout-options">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            className={`layout-option ${value === layout.id ? "active" : ""}`}
            onClick={() => onChange(layout.id)}
          >
            {layout.label}
          </button>
        ))}
      </div>
    </div>
  );
}
