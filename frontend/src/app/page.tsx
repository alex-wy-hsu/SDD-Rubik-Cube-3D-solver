'use client';

import React, { useEffect } from 'react';
import { useCubeStore } from '@/store/cubeStore';
import { ScrambleButton } from '@/components/Controls/ScrambleButton';
import { SeedDisplay } from '@/components/Controls/SeedDisplay';

export default function Home() {
  const { initializeScramble } = useCubeStore();

  // Initialize scramble on app launch
  useEffect(() => {
    initializeScramble();
  }, [initializeScramble]);

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

        {/* Cube rendering will be added in US1 */}
        <div className="flex justify-center items-center min-h-[400px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-gray-500 dark:text-gray-400">
            3D Cube visualization coming in Phase 4 (US1)
          </div>
        </div>

        {/* Loading indicator */}
        <div
          data-testid="loading-indicator"
          className="hidden"
          aria-hidden="true"
        />

        {/* Error message */}
        <div
          data-testid="error-message"
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </main>
  );
}
