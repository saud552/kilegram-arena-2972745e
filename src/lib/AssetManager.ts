// ============================================
// AssetManager - Centralized 3D Asset Loading with Draco & LOD
// Handles lazy loading, caching, and performance optimization
// Target: Keep initial load < 5MB
// ============================================

import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export type AssetPriority = 'critical' | 'high' | 'low';
export type LODLevel = 'procedural' | 'low' | 'high';

interface CachedAsset {
  scene: THREE.Group;
  loadedAt: number;
  byteSize: number;
}

interface LoadRequest {
  path: string;
  priority: AssetPriority;
  resolve: (gltf: GLTF) => void;
  reject: (err: Error) => void;
}

class AssetManagerClass {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private cache = new Map<string, CachedAsset>();
  private loading = new Set<string>();
  private queue: LoadRequest[] = [];
  private maxConcurrent = 2; // limit concurrent loads on mobile
  private activeLoads = 0;
  private totalBytesLoaded = 0;
  private readonly MAX_CACHE_BYTES = 50 * 1024 * 1024; // 50MB cache limit

  constructor() {
    // Initialize Draco decoder
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.setDecoderConfig({ type: 'js' }); // JS decoder for max compat
    this.dracoLoader.preload();

    // Initialize GLTF loader with Draco
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  /** Load a GLB model with caching and priority queue */
  async loadModel(path: string, priority: AssetPriority = 'low'): Promise<GLTF> {
    // Return cached
    const cached = this.cache.get(path);
    if (cached) {
      return { scene: cached.scene.clone() } as GLTF;
    }

    // Already loading? Wait for it
    if (this.loading.has(path)) {
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          const c = this.cache.get(path);
          if (c) {
            clearInterval(check);
            resolve({ scene: c.scene.clone() } as GLTF);
          }
          if (!this.loading.has(path) && !this.cache.has(path)) {
            clearInterval(check);
            reject(new Error(`Failed to load: ${path}`));
          }
        }, 100);
      });
    }

    return new Promise((resolve, reject) => {
      const request: LoadRequest = { path, priority, resolve, reject };

      // Insert by priority
      if (priority === 'critical') {
        this.queue.unshift(request);
      } else if (priority === 'high') {
        const criticalEnd = this.queue.findIndex(r => r.priority !== 'critical');
        this.queue.splice(criticalEnd === -1 ? this.queue.length : criticalEnd, 0, request);
      } else {
        this.queue.push(request);
      }

      this.processQueue();
    });
  }

  private processQueue() {
    while (this.activeLoads < this.maxConcurrent && this.queue.length > 0) {
      const request = this.queue.shift()!;
      this.executeLoad(request);
    }
  }

  private async executeLoad(request: LoadRequest) {
    const { path, resolve, reject } = request;
    this.loading.add(path);
    this.activeLoads++;

    try {
      const gltf = await new Promise<GLTF>((res, rej) => {
        this.gltfLoader.load(
          path,
          (gltf) => res(gltf),
          undefined,
          (err) => rej(new Error(`GLB load error: ${path} - ${err}`)),
        );
      });

      // Optimize the loaded model
      this.optimizeModel(gltf.scene);

      // Estimate byte size
      const byteSize = this.estimateByteSize(gltf.scene);
      this.totalBytesLoaded += byteSize;

      // Evict old cache if over limit
      this.evictIfNeeded();

      // Cache it
      this.cache.set(path, {
        scene: gltf.scene,
        loadedAt: Date.now(),
        byteSize,
      });

      resolve({ scene: gltf.scene.clone() } as GLTF);
    } catch (err) {
      reject(err as Error);
    } finally {
      this.loading.delete(path);
      this.activeLoads--;
      this.processQueue();
    }
  }

  /** Simplify materials and reduce texture sizes for mobile performance */
  private optimizeModel(scene: THREE.Group) {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Reduce shadow overhead
        child.castShadow = false;
        child.receiveShadow = false;

        // Simplify materials
        const mat = child.material;
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.envMapIntensity = 0.3;
          mat.roughness = Math.max(mat.roughness, 0.5);

          // Downscale textures
          if (mat.map) this.downscaleTexture(mat.map);
          if (mat.normalMap) this.downscaleTexture(mat.normalMap);
          // Remove heavy maps
          if (mat.aoMap) { mat.aoMap.dispose(); mat.aoMap = null; }
          if (mat.metalnessMap) { mat.metalnessMap.dispose(); mat.metalnessMap = null; }
          if (mat.roughnessMap) { mat.roughnessMap.dispose(); mat.roughnessMap = null; }
        }
      }
    });
  }

  private downscaleTexture(texture: THREE.Texture, maxSize = 256) {
    if (!texture.image) return;
    const img = texture.image as HTMLImageElement | HTMLCanvasElement;
    if (!('width' in img) || !('height' in img)) return;
    if (img.width <= maxSize && img.height <= maxSize) return;

    const canvas = document.createElement('canvas');
    const scale = maxSize / Math.max(img.width, img.height);
    canvas.width = Math.floor(img.width * scale);
    canvas.height = Math.floor(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img as CanvasImageSource, 0, 0, canvas.width, canvas.height);
    texture.image = canvas;
    texture.needsUpdate = true;
  }

  private estimateByteSize(scene: THREE.Group): number {
    let bytes = 0;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geo = child.geometry;
        if (geo.attributes.position) bytes += geo.attributes.position.array.byteLength;
        if (geo.attributes.normal) bytes += geo.attributes.normal.array.byteLength;
        if (geo.index) bytes += geo.index.array.byteLength;
      }
    });
    return bytes;
  }

  private evictIfNeeded() {
    if (this.totalBytesLoaded <= this.MAX_CACHE_BYTES) return;

    // Evict oldest entries
    const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].loadedAt - b[1].loadedAt);
    while (this.totalBytesLoaded > this.MAX_CACHE_BYTES * 0.7 && entries.length > 0) {
      const [key, val] = entries.shift()!;
      this.totalBytesLoaded -= val.byteSize;
      val.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) child.material.dispose();
        }
      });
      this.cache.delete(key);
    }
  }

  /** Determine LOD level based on distance from camera */
  getLODLevel(distance: number): LODLevel {
    if (distance < 20) return 'high';   // Close: use GLB model
    if (distance < 60) return 'low';    // Mid: simplified geometry
    return 'procedural';                // Far: pure procedural shapes
  }

  /** Check if a model is already cached */
  isCached(path: string): boolean {
    return this.cache.has(path);
  }

  /** Get loading stats */
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loading.size,
      queued: this.queue.length,
      totalMB: (this.totalBytesLoaded / 1024 / 1024).toFixed(1),
    };
  }

  /** Preload a list of models in background */
  preload(paths: string[]) {
    paths.forEach(p => this.loadModel(p, 'low').catch(() => {}));
  }

  dispose() {
    this.cache.forEach((val) => {
      val.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) child.material.dispose();
        }
      });
    });
    this.cache.clear();
    this.dracoLoader.dispose();
    this.totalBytesLoaded = 0;
  }
}

// Singleton
export const AssetManager = new AssetManagerClass();
