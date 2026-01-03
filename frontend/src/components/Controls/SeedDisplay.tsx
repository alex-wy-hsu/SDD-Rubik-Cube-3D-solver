'use client';

import React from 'react';
import { useCubeStore } from '@/store/cubeStore';

export const SeedDisplay: React.FC = () => {
  const { scrambleSeed } = useCubeStore();

  if (!scrambleSeed) {
    return null;
  }

  return (
    <div
      data-testid="seed-display"
      className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg"
    >
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        Seed
      </div>
      <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
        {scrambleSeed}
      </div>
    </div>
  );
};
