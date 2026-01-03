'use client';

import React, { useEffect } from 'react';
import { useCubeStore } from '@/store/cubeStore';
import { ScrambleButton } from '@/components/Controls/ScrambleButton';
import { SeedDisplay } from '@/components/Controls/SeedDisplay';
import { Cube3D } from '@/components/Cube3D/Cube';
import { HighlightEffect } from '@/components/Cube3D/HighlightEffect';
import { RotationArrows } from '@/components/Controls/RotationArrows';
import type { Face } from '@/lib/cube/Move';

export default function Home() {
  const {
    cubeState,
    selectedLayer,
    isAnimating,
    initializeScramble,
    selectLayer,
    executeRotation,
  } = useCubeStore();

  // Initialize scramble on app launch
  useEffect(() => {
    initializeScramble();
  }, [initializeScramble]);

  const handleLayerSelect = (layer: Face) => {
    if (!isAnimating) {
      selectLayer(layer);
    }
  };

  const handleRotate = (direction: 1 | -1) => {
    if (selectedLayer && !isAnimating) {
      executeRotation({
        face: selectedLayer as Face,
        direction,
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          3D Rubik's Cube Solver
        </h1>

        {/* Controls section */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <SeedDisplay />
          <ScrambleButton />
        </div>

        {/* Cube rendering */}
        <div className="relative flex justify-center items-center h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <Cube3D
            facelets={cubeState.facelets}
            selectedLayer={selectedLayer}
            isAnimating={isAnimating}
            onLayerSelect={handleLayerSelect}
          />
          
          {/* Highlight effect overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <HighlightEffect selectedLayer={selectedLayer as Face | null} />
          </div>

          {/* Rotation controls */}
          <RotationArrows
            selectedLayer={selectedLayer}
            isAnimating={isAnimating}
            onRotate={handleRotate}
          />
        </div>

        {/* Cube status */}
        <div className="mt-4 text-center">
          {cubeState.isSolved && (
            <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
              ✅ Solved!
            </div>
          )}
          {!cubeState.isValid && (
            <div className="inline-block px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
              ⚠️ Invalid cube state
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {isAnimating && (
          <div
            data-testid="loading-indicator"
            className="mt-4 text-center text-gray-500 dark:text-gray-400"
          >
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </main>
  );
}
