'use client';

import React from 'react';
import { useCubeStore } from '@/store/cubeStore';

export const ScrambleButton: React.FC = () => {
  const { isAnimating, regenerateScramble } = useCubeStore();

  const handleScramble = async () => {
    await regenerateScramble();
  };

  return (
    <button
      data-testid="scramble-button"
      onClick={handleScramble}
      disabled={isAnimating}
      className={`
        px-6 py-3 rounded-lg font-semibold text-white
        transition-all duration-200
        ${
          isAnimating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }
      `}
    >
      {isAnimating ? 'Scrambling...' : 'New Scramble'}
    </button>
  );
};
