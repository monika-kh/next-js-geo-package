export function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="map-controls">
      <button onClick={onZoomIn} aria-label="Zoom in">
        +
      </button>
      <button onClick={onZoomOut} aria-label="Zoom out">
        −
      </button>
      <button onClick={onReset} aria-label="Reset map">
        ⌂
      </button>
    </div>
  );
}
