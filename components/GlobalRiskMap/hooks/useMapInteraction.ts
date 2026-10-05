import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { MapLayout } from "../types";

const INITIAL_TRANSFORM = { x: 0, y: 0, k: 1 };
const INITIAL_ROTATION: [number, number, number] = [0, 0, 0];

export function useMapInteraction(layout: MapLayout) {
  const [rotation, setRotation] =
    useState<[number, number, number]>(INITIAL_ROTATION);
  const [transform, setTransform] = useState(INITIAL_TRANSFORM);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (layout !== "globe") return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (layout !== "globe" || !dragRef.current) return;

    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY };

    setRotation(([longitude, latitude, gamma]) => [
      longitude + dx * 0.5,
      Math.max(-85, Math.min(85, latitude - dy * 0.35)),
      gamma,
    ]);
  };

  const onPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    setIsDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
  };

  const reset = () => {
    setRotation(INITIAL_ROTATION);
    setTransform(INITIAL_TRANSFORM);
    setIsDragging(false);
    dragRef.current = null;
  };

  return {
    rotation,
    transform,
    setTransform,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    reset,
  };
}
