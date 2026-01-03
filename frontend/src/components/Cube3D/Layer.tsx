/**
 * Layer component representing one face of the cube
 * Contains 9 facelets arranged in a 3x3 grid
 */
'use client';

import { Facelet } from './Facelet';
import type { Face } from '@/lib/cube/Move';

interface LayerProps {
  facelets: string; // 9 characters
  face: Face;
  position: [number, number, number];
  rotation: [number, number, number];
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

/**
 * Layer Component
 * 
 * Renders a single face of the Rubik's Cube as a 3x3 grid of facelets
 * - 9 Facelet components
 * - Positioned and rotated in 3D space
 * - Click detection for layer selection
 */
export function Layer({
  facelets,
  face,
  position,
  rotation,
  selected = false,
  disabled = false,
  onSelect,
}: LayerProps) {
  if (facelets.length !== 9) {
    console.error(`Layer ${face} must have exactly 9 facelets, got ${facelets.length}`);
    return null;
  }

  // Generate 3x3 grid of facelets
  const faceletGrid: { color: string; position: [number, number, number] }[] = [];
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const color = facelets[index];
      
      // Position relative to layer center
      // Grid: -1, 0, 1 for each axis
      const x = (col - 1) * 0.5;
      const y = (1 - row) * 0.5; // Invert Y so row 0 is top
      
      faceletGrid.push({
        color,
        position: [x, y, 0],
      });
    }
  }

  return (
    <group position={position} rotation={rotation}>
      {faceletGrid.map((facelet, index) => (
        <Facelet
          key={`${face}-${index}`}
          color={facelet.color}
          position={facelet.position}
          selected={selected}
          disabled={disabled}
          onClick={onSelect}
        />
      ))}
    </group>
  );
}
