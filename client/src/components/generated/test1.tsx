import { memo, useRef, useEffect, useState } from "react";
import { createSplineApp } from "@/lib/spline-loader";

interface Test1Props {
  className?: string;
}

export const Test1 = memo(function Test1({ className = "" }: Test1Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let app: any;
    let canceled = false;

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
        app = await createSplineApp(canvasRef.current, 1.75);

        if (canceled) {
          app.destroy?.();
          return;
        }

        // Load the Spline scene for Test1
        await app.load('https://prod.spline.design/r8XEjn9WlpwRm3DU/scene.splinecode');

        if (!canceled) {
          appRef.current = app;
          setIsLoading(false);
        } else {
          app.destroy?.();
        }
      } catch (error) {
        console.error('Failed to load Test1 Spline scene:', error);
        setError(error instanceof Error ? error.message : 'Failed to load 3D scene');
        setIsLoading(false);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      canceled = true;
      if (appRef.current) {
        try {
          appRef.current.destroy?.();
        } catch (error) {
          console.warn('Error destroying Test1 Spline app:', error);
        }
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl w-full h-64 sm:h-80 md:h-96 lg:h-[500px] ${className}`}
    >
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
        className="w-full h-full block outline-none"
        style={{
          background: 'transparent',
          display: 'block',
        }}
      />
    </div>
  );
});
