/**
 * Shared Spline Runtime Loader
 * Prevents multiple instances of the Spline runtime from being loaded
 * Reduces bundle size and improves performance significantly
 */

let splineRuntime: any = null;
let loadingPromise: Promise<any> | null = null;
let isInitialized = false;

export interface SplineApp {
  destroy(): void;
  load(url: string): Promise<void>;
  pause?(): void;
  play?(): void;
  resize?(): void;
  setPixelRatio?(ratio: number): void;
}

export interface SplineRuntime {
  Application: new (canvas: HTMLCanvasElement) => SplineApp;
}

/**
 * Loads the Spline runtime once and reuses it across all components
 * @returns Promise<SplineRuntime> - The loaded Spline runtime
 */
export async function loadSplineRuntime(): Promise<SplineRuntime> {
  if (splineRuntime) {
    return splineRuntime;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = import('https://unpkg.com/@splinetool/runtime@1.10.56/build/runtime.js')
    .then((module) => {
      splineRuntime = module;
      isInitialized = true;
      return module;
    })
    .catch((error) => {
      console.error('Failed to load Spline runtime:', error);
      loadingPromise = null; // Reset on error to allow retry
      throw error;
    });

  return loadingPromise;
}

/**
 * Creates a new Spline application instance
 * @param canvas - The canvas element to render on
 * @param maxDpr - Maximum device pixel ratio for performance
 * @returns Promise<SplineApp> - The Spline application instance
 */
export async function createSplineApp(
  canvas: HTMLCanvasElement,
  maxDpr: number = 1.75
): Promise<SplineApp> {
  // Additional canvas size validation to prevent WebGL errors
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error(`Canvas has invalid dimensions: ${rect.width}x${rect.height}. Cannot create WebGL context.`);
  }

  // Ensure canvas has proper dimensions
  if (canvas.width <= 0 || canvas.height <= 0) {
    canvas.width = Math.max(1, rect.width);
    canvas.height = Math.max(1, rect.height);
  }

  const runtime = await loadSplineRuntime();
  const app = new runtime.Application(canvas);

  // Performance optimization: cap DPR for hi-DPI displays
  const desiredDpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  try {
    app.setPixelRatio?.(desiredDpr);
  } catch {
    // Older runtime versions may not support setPixelRatio
  }

  return app;
}

/**
 * Checks if the Spline runtime is already loaded
 */
export function isSplineRuntimeLoaded(): boolean {
  return isInitialized && splineRuntime !== null;
}

/**
 * Preloads the Spline runtime for better performance
 * Call this early in your app lifecycle
 */
export function preloadSplineRuntime(): void {
  if (!isInitialized && !loadingPromise) {
    loadSplineRuntime().catch(() => {
      // Silent fail for preload
    });
  }
}

/**
 * Waits for canvas to have proper dimensions before initializing WebGL
 * @param canvas - The canvas element to check
 * @param maxAttempts - Maximum number of attempts (default: 50)
 * @param delay - Delay between attempts in ms (default: 16)
 * @returns Promise<void> - Resolves when canvas has valid dimensions
 */
export function waitForCanvasSize(
  canvas: HTMLCanvasElement,
  maxAttempts: number = 50,
  delay: number = 16
): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkSize = () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        reject(new Error(`Canvas size validation timeout after ${maxAttempts} attempts`));
        return;
      }
      
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // Ensure canvas has proper dimensions
        if (canvas.width <= 0 || canvas.height <= 0) {
          canvas.width = Math.max(1, rect.width);
          canvas.height = Math.max(1, rect.height);
        }
        resolve();
      } else {
        setTimeout(checkSize, delay);
      }
    };
    
    checkSize();
  });
}
