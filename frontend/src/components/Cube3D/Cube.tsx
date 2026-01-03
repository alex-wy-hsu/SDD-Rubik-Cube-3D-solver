/**
 * Main Cube component using React Three Fiber
 * Renders the complete 3D Rubik's Cube with camera controls
 */
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Layer } from './Layer';
import type { Face } from '@/lib/cube/Move';

interface Cube3DProps {
  facelets: string;
  selectedLayer?: Face | null;
  isAnimating?: boolean;
  onLayerSelect?: (layer: Face) => void;
}

/**
 * Cube3D Component
 * 
 * Renders a 3D Rubik's Cube using Three.js via React Three Fiber
 * - 6 layers (U, D, L, R, F, B)
 * - OrbitControls for camera rotation
 * - Click detection for layer selection
 * - Smooth animations
 */
export function Cube3D({
  facelets,
  selectedLayer = null,
  isAnimating = false,
  onLayerSelect,
}: Cube3DProps) {
  // Split facelets into 6 faces (9 facelets each)
  const faces = {
    U: facelets.slice(0, 9),
    R: facelets.slice(9, 18),
    F: facelets.slice(18, 27),
    D: facelets.slice(27, 36),
    L: facelets.slice(36, 45),
    B: facelets.slice(45, 54),
  };

  return (
    <div className="w-full h-full" data-testid="canvas">
      <Canvas>
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Camera controls - left click drag to rotate */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={10}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Cube layers */}
        <group>
          {/* U - Top layer (white) */}
          <Layer
            facelets={faces.U}
            face="U"
            position={[0, 1.5, 0]}
            rotation={[0, 0, 0]}
            selected={selectedLayer === 'U'}
            disabled={isAnimating}
            onSelect={() => !isAnimating && onLayerSelect?.('U')}
          />

          {/* D - Bottom layer (yellow) */}
          <Layer
            facelets={faces.D}
            face="D"
            position={[0, -1.5, 0]}
            rotation={[Math.PI, 0, 0]}
            selected={selectedLayer === 'D'}
            disabled={isAnimating}
            onSelect={() => !isAnimating && onLayerSelect?.('D')}
          />

          {/* F - Front layer (green) */}
          <Layer
            facelets={faces.F}
            face="F"
            position={[0, 0, 1.5]}
            rotation={[Math.PI / 2, 0, 0]}
            selected={selectedLayer === 'F'}
            disabled={isAnimating}
            onSelect={() => !isAnimating && onLayerSelect?.('F')}
          />

          {/* B - Back layer (blue) */}
          <Layer
            facelets={faces.B}
            face="B"
            position={[0, 0, -1.5]}
            rotation={[-Math.PI / 2, 0, 0]}
            selected={selectedLayer === 'B'}
            disabled={isAnimating}
            onSelect={() => !isAnimating && onLayerSelect?.('B')}
          />

          {/* R - Right layer (red) */}
          <Layer
            facelets={faces.R}
            face="R"
            position={[1.5, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            selected={selectedLayer === 'R'}
            disabled={isAnimating}
            onSelect={() => !isAnimating && onLayerSelect?.('R')}
          />

          {/* L - Left layer (orange) */}
          <Layer
            facelets={faces.L}
            face="L"
            position={[-1.5, 0, 0]}
            rotation={[0, 0, -Math.PI / 2]}
            selected={selectedLayer === 'L'}
            disabled={isAnimating}
            onSelect={() => !isAnimating && onLayerSelect?.('L')}
          />
        </group>
      </Canvas>
    </div>
  );
}
