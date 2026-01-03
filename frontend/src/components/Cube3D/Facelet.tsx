/**
 * Facelet component representing a single colored square on the cube
 * Uses standard Rubik's Cube color scheme
 */
'use client';

import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { ThreeEvent } from '@react-three/fiber';

interface FaceletProps {
  color: string; // U, R, F, D, L, B
  position: [number, number, number];
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

// Standard Rubik's Cube color mapping
const COLOR_MAP: Record<string, string> = {
  U: '#FFFFFF', // White
  D: '#FFFF00', // Yellow
  F: '#00FF00', // Green
  B: '#0000FF', // Blue
  L: '#FF8800', // Orange
  R: '#FF0000', // Red
};

/**
 * Facelet Component
 * 
 * Renders a single colored square (facelet) of the Rubik's Cube
 * - Standard color scheme
 * - Click detection
 * - Hover effects
 * - Black borders
 */
export function Facelet({
  color,
  position,
  selected = false,
  disabled = false,
  onClick,
}: FaceletProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const hexColor = COLOR_MAP[color] || '#CCCCCC';

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!disabled) {
      setHovered(true);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group position={position}>
      {/* Main facelet */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[0.45, 0.45]} />
        <meshStandardMaterial
          color={hexColor}
          emissive={selected ? hexColor : '#000000'}
          emissiveIntensity={selected ? 0.3 : 0}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Border (black outline) */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[0.48, 0.48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Hover effect */}
      {hovered && !disabled && (
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.46, 0.46]} />
          <meshBasicMaterial
            color="#FFFFFF"
            opacity={0.2}
            transparent
          />
        </mesh>
      )}
    </group>
  );
}
