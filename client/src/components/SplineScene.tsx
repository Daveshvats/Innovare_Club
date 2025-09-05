// src/components/SplineScene.tsx
import React, { memo, useEffect, useRef, useState } from "react";
import { createSplineApp } from '@/lib/spline-loader';

export interface SplineSceneProps {
  className?: string;
  sceneUrl: string;
  /** Cap devicePixelRatio to reduce GPU load (default 1.75) */
  maxDpr?: number;
}

/**
 * SplineScene
 * - Uses shared Spline runtime loader with canvas size validation
 * - Caps DPR for perf, observes resize, pauses on tab hidden
 * - Fully destroys the Spline app on unmount
 */
export const SplineScene = memo(function SplineScene({
  className = "",
  sceneUrl,
  maxDpr = 1.75,
}: SplineSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<any>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    let removeVisibility: (() => void) | null = null;

    async function init() {
      if (!canvasRef.current || canceled) return;
      
      // Wait for canvas to have proper dimensions
      const waitForCanvasSize = () => {
        return new Promise<void>((resolve) => {
          const checkSize = () => {
            if (canvasRef.current && !canceled) {
              const rect = canvasRef.current.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                resolve();
              } else {
                requestAnimationFrame(checkSize);
              }
            } else {
              resolve();
            }
          };
          checkSize();
        });
      };

      try {
        setIsLoading(true);
        setError(null);
        
        await waitForCanvasSize();
        
        if (!canvasRef.current || canceled) return;
        
        // Use shared Spline runtime loader
        const app = await createSplineApp(canvasRef.current, maxDpr);

        if (canceled) {
          app.destroy?.();
          return;
        }

        // Load scene
        await app.load(sceneUrl);
        
        if (!canceled) {
          appRef.current = app;

          // Resize observer to keep canvas sharp
          roRef.current = new ResizeObserver(() => {
            try { app.resize?.(); } catch {
              try { app.setPixelRatio?.(maxDpr); } catch {}
            }
          });
          roRef.current.observe(canvasRef.current!);

          // Pause when tab is hidden
          const onVisibility = () => {
            try {
              if (document.hidden) app.pause?.();
              else app.play?.();
            } catch {}
          };
          document.addEventListener("visibilitychange", onVisibility);
          removeVisibility = () => document.removeEventListener("visibilitychange", onVisibility);
          
          setIsLoading(false);
        } else {
          app.destroy?.();
        }
      } catch (err) {
        console.error("[SplineScene] Failed to init:", err);
        setError(err instanceof Error ? err.message : 'Failed to load 3D scene');
        setIsLoading(false);
      }
    }

    init();

    return () => {
      canceled = true;
      try { removeVisibility?.(); } catch {}
      try { roRef.current?.disconnect(); } catch {}
      roRef.current = null;

      if (appRef.current) {
        try { appRef.current.destroy?.(); } catch (e) {
          console.warn("[SplineScene] Error destroying app:", e);
        }
        appRef.current = null;
      }
    };
  }, [sceneUrl, maxDpr]);

  return (
    <div className={`relative w-full h-full rounded-2xl ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading 3D scene...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-2xl">
          <div className="text-center p-4">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">Failed to load 3D scene</p>
            <p className="text-xs text-red-500 dark:text-red-500">{error}</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="block w-full h-full outline-none"
        style={{ 
          background: "transparent",
          minWidth: '1px',
          minHeight: '1px'
        }}
      />
    </div>
  );
});