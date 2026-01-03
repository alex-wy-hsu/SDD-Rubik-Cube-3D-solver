/**
 * Animation management for cube rotations
 * Handles animation queue and smooth interpolation
 */
import type { Move } from '../cube/Move';

export interface AnimationConfig {
  duration: number; // milliseconds (150-300ms)
  easing?: (t: number) => number;
}

export interface QueuedAnimation {
  move: Move;
  config: AnimationConfig;
  onComplete?: () => void;
}

/**
 * Default easing function - ease-in-out cubic
 * @param t Progress from 0 to 1
 * @returns Eased value
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * AnimationQueue
 * 
 * Manages a queue of animations to be played sequentially
 * - Smooth interpolation (150-300ms per move)
 * - Sequential execution
 * - Callback on completion
 */
export class AnimationQueue {
  private queue: QueuedAnimation[] = [];
  private isPlaying: boolean = false;
  private currentAnimation: QueuedAnimation | null = null;

  /**
   * Add a move to the animation queue
   */
  enqueue(animation: QueuedAnimation): void {
    this.queue.push(animation);
    
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  /**
   * Add multiple moves to the queue
   */
  enqueueAll(animations: QueuedAnimation[]): void {
    this.queue.push(...animations);
    
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  /**
   * Clear the queue and stop current animation
   */
  clear(): void {
    this.queue = [];
    this.currentAnimation = null;
    this.isPlaying = false;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0 && !this.isPlaying;
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length + (this.isPlaying ? 1 : 0);
  }

  /**
   * Play the next animation in the queue
   */
  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    this.currentAnimation = this.queue.shift()!;

    await this.animate(this.currentAnimation);

    this.currentAnimation = null;
    this.playNext();
  }

  /**
   * Execute a single animation
   */
  private async animate(animation: QueuedAnimation): Promise<void> {
    const { move, config, onComplete } = animation;
    const { duration, easing = easeInOutCubic } = config;

    return new Promise((resolve) => {
      const startTime = performance.now();

      const tick = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        // Animation progress callback would go here
        // In actual implementation, this would update the rotation state

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          onComplete?.();
          resolve();
        }
      };

      requestAnimationFrame(tick);
    });
  }
}

/**
 * Create an animation config with default values
 */
export function createAnimationConfig(
  duration: number = 200,
  easing?: (t: number) => number
): AnimationConfig {
  return {
    duration,
    easing: easing || easeInOutCubic,
  };
}

/**
 * Convert moves to queued animations
 */
export function movesToAnimations(
  moves: Move[],
  config?: AnimationConfig
): QueuedAnimation[] {
  const defaultConfig = config || createAnimationConfig();
  
  return moves.map(move => ({
    move,
    config: defaultConfig,
  }));
}

/**
 * Calculate rotation angle for a move direction
 * @param direction 1 (CW), -1 (CCW), or 2 (180°)
 * @returns Rotation angle in radians
 */
export function moveToRotationAngle(direction: 1 | -1 | 2): number {
  if (direction === 2) return Math.PI; // 180°
  return direction * (Math.PI / 2); // ±90°
}

/**
 * Interpolate between two angles
 */
export function lerpAngle(start: number, end: number, t: number): number {
  // Normalize angles to [-π, π]
  const normalize = (angle: number) => {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  };

  const normalizedStart = normalize(start);
  const normalizedEnd = normalize(end);
  
  // Take shortest path
  let diff = normalizedEnd - normalizedStart;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;
  
  return normalizedStart + diff * t;
}
