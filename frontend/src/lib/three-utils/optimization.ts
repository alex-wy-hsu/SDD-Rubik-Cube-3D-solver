/**
 * Three.js performance optimization utilities
 * - Geometry reuse
 * - Frustum culling
 * - Memory management
 */
import * as THREE from 'three';

/**
 * Geometry cache for reusing geometries across multiple meshes
 */
class GeometryCache {
  private cache: Map<string, THREE.BufferGeometry> = new Map();

  /**
   * Get or create a plane geometry
   */
  getPlaneGeometry(width: number, height: number): THREE.BufferGeometry {
    const key = `plane-${width}-${height}`;
    
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.PlaneGeometry(width, height));
    }
    
    return this.cache.get(key)!;
  }

  /**
   * Get or create a box geometry
   */
  getBoxGeometry(width: number, height: number, depth: number): THREE.BufferGeometry {
    const key = `box-${width}-${height}-${depth}`;
    
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.BoxGeometry(width, height, depth));
    }
    
    return this.cache.get(key)!;
  }

  /**
   * Clear all cached geometries
   */
  clear(): void {
    this.cache.forEach(geometry => geometry.dispose());
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Material cache for reusing materials
 */
class MaterialCache {
  private cache: Map<string, THREE.Material> = new Map();

  /**
   * Get or create a mesh standard material
   */
  getMeshStandardMaterial(config: {
    color: string | number;
    roughness?: number;
    metalness?: number;
    emissive?: string | number;
    emissiveIntensity?: number;
  }): THREE.MeshStandardMaterial {
    const key = `standard-${JSON.stringify(config)}`;
    
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        new THREE.MeshStandardMaterial({
          color: config.color,
          roughness: config.roughness ?? 0.5,
          metalness: config.metalness ?? 0.1,
          emissive: config.emissive,
          emissiveIntensity: config.emissiveIntensity ?? 0,
        })
      );
    }
    
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  /**
   * Get or create a mesh basic material
   */
  getMeshBasicMaterial(config: {
    color: string | number;
    transparent?: boolean;
    opacity?: number;
  }): THREE.MeshBasicMaterial {
    const key = `basic-${JSON.stringify(config)}`;
    
    if (!this.cache.has(key)) {
      this.cache.set(
        key,
        new THREE.MeshBasicMaterial({
          color: config.color,
          transparent: config.transparent ?? false,
          opacity: config.opacity ?? 1,
        })
      );
    }
    
    return this.cache.get(key) as THREE.MeshBasicMaterial;
  }

  /**
   * Clear all cached materials
   */
  clear(): void {
    this.cache.forEach(material => material.dispose());
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Global caches
 */
export const geometryCache = new GeometryCache();
export const materialCache = new MaterialCache();

/**
 * Enable frustum culling for a mesh
 */
export function enableFrustumCulling(mesh: THREE.Mesh): void {
  mesh.frustumCulled = true;
}

/**
 * Disable frustum culling for a mesh
 */
export function disableFrustumCulling(mesh: THREE.Mesh): void {
  mesh.frustumCulled = false;
}

/**
 * Optimize scene by enabling frustum culling on all meshes
 */
export function optimizeScene(scene: THREE.Scene): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      enableFrustumCulling(object);
    }
  });
}

/**
 * Dispose of a mesh and its geometry/material
 */
export function disposeMesh(mesh: THREE.Mesh): void {
  if (mesh.geometry) {
    mesh.geometry.dispose();
  }
  
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => material.dispose());
    } else {
      mesh.material.dispose();
    }
  }
}

/**
 * Dispose of a scene and all its children
 */
export function disposeScene(scene: THREE.Scene): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      disposeMesh(object);
    }
  });
  
  scene.clear();
}

/**
 * Clean up caches
 */
export function cleanupCaches(): void {
  geometryCache.clear();
  materialCache.clear();
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private maxSamples: number = 60; // 1 second at 60 FPS

  /**
   * Record a frame time
   */
  recordFrame(deltaTime: number): void {
    this.frameTimes.push(deltaTime);
    
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }

  /**
   * Get average FPS
   */
  getAverageFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return 1000 / avgFrameTime;
  }

  /**
   * Get minimum FPS (P95)
   */
  getP95FPS(): number {
    if (this.frameTimes.length === 0) return 0;
    
    const sorted = [...this.frameTimes].sort((a, b) => b - a);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95FrameTime = sorted[p95Index];
    
    return 1000 / p95FrameTime;
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.frameTimes = [];
  }
}

/**
 * Global performance monitor
 */
export const performanceMonitor = new PerformanceMonitor();
