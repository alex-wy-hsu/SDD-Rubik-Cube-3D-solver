/**
 * RotationArrows component
 * Displays clockwise and counterclockwise rotation buttons when a layer is selected
 */
'use client';

import { ArrowRotateClockwise, ArrowRotateCounterclockwise } from '@/components/icons';
import type { Face } from '@/lib/cube/Move';

interface RotationArrowsProps {
  selectedLayer: Face | null;
  isAnimating: boolean;
  onRotate: (direction: 1 | -1) => void;
}

/**
 * RotationArrows Component
 * 
 * Shows rotation control buttons when a layer is selected
 * - Clockwise rotation (direction: 1)
 * - Counterclockwise rotation (direction: -1)
 * - Disabled during animation
 */
export function RotationArrows({
  selectedLayer,
  isAnimating,
  onRotate,
}: RotationArrowsProps) {
  if (!selectedLayer) {
    return null;
  }

  const handleCW = () => {
    if (!isAnimating) {
      onRotate(1);
    }
  };

  const handleCCW = () => {
    if (!isAnimating) {
      onRotate(-1);
    }
  };

  return (
    <div
      data-testid="rotation-arrows"
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 bg-black/50 backdrop-blur-sm p-4 rounded-xl"
    >
      {/* Counter-clockwise button */}
      <button
        onClick={handleCCW}
        disabled={isAnimating}
        aria-label="逆時針旋轉 / Rotate counterclockwise"
        className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
      >
        <ArrowRotateCounterclockwise className="w-8 h-8 text-white" />
      </button>

      {/* Layer indicator */}
      <div className="flex items-center px-4 bg-gray-800 rounded-lg">
        <span className="text-2xl font-bold text-white">
          {selectedLayer}
        </span>
      </div>

      {/* Clockwise button */}
      <button
        onClick={handleCW}
        disabled={isAnimating}
        aria-label="順時針旋轉 / Rotate clockwise"
        className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
      >
        <ArrowRotateClockwise className="w-8 h-8 text-white" />
      </button>
    </div>
  );
}
