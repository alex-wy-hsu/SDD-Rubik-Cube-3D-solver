/**
 * HighlightEffect component for showing the selected layer
 * Features:
 * - Glow effect (outline)
 * - Semi-transparent overlay
 * - Pulsing animation (1.5-2s period, 1-2% scale)
 */
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import type { Face } from '@/lib/cube/Move';

interface HighlightEffectProps {
  selectedLayer: Face | null;
  intensity?: number; // 0-1, controls glow intensity
  color?: string; // Hex color
}

// Layer position mapping
const LAYER_POSITIONS: Record<Face, [number, number, number]> = {
  U: [0, 1.5, 0],
  D: [0, -1.5, 0],
  F: [0, 0, 1.5],
  B: [0, 0, -1.5],
  R: [1.5, 0, 0],
  L: [-1.5, 0, 0],
};

// Layer rotation mapping
const LAYER_ROTATIONS: Record<Face, [number, number, number]> = {
  U: [0, 0, 0],
  D: [Math.PI, 0, 0],
  F: [Math.PI / 2, 0, 0],
  B: [-Math.PI / 2, 0, 0],
  R: [0, 0, Math.PI / 2],
  L: [0, 0, -Math.PI / 2],
};

/**
 * HighlightEffect Component
 * 
 * Renders a pulsing highlight effect on the selected layer
 * - Semi-transparent cyan overlay
 * - Smooth sine wave pulsing animation
 * - 1.5-2s animation period
 * - 1-2% scale variation
 */
export function HighlightEffect({
  selectedLayer,
  intensity = 0.7,
  color = '#00FFFF', // Cyan
}: HighlightEffectProps) {
  const meshRef = useRef<Mesh>(null);

  // Pulsing animation
  useFrame(({ clock }) => {
    if (!meshRef.current || !selectedLayer) return;

    const elapsed = clock.getElapsedTime();
    
    // Sine wave with 2-second period
    // Period = 2.0s, so angular frequency = 2π / 2 = π
    const scale = 1.0 + 0.01 * Math.sin(elapsed * Math.PI);
    
    meshRef.current.scale.set(scale, scale, 1);
    
    // Optional: vary opacity for extra effect
    const opacity = 0.15 + 0.05 * Math.sin(elapsed * Math.PI);
    if (meshRef.current.material && 'opacity' in meshRef.current.material) {
      (meshRef.current.material as any).opacity = opacity * intensity;
    }
  });

  if (!selectedLayer) {
    return null;
  }

  const position = LAYER_POSITIONS[selectedLayer];
  const rotation = LAYER_ROTATIONS[selectedLayer];

  return (
    <group position={position} rotation={rotation}>
      {/* Semi-transparent overlay */}
      <mesh ref={meshRef} position={[0, 0, 0.01]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2 * intensity}
        />
      </mesh>

      {/* Glow effect (larger, more transparent) */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1 * intensity}
        />
      </mesh>

      {/* Outer glow */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[2.1, 2.1]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05 * intensity}
        />
      </mesh>
    </group>
  );
}
