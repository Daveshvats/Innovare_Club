import { memo, useEffect, useRef, useState } from 'react';
import { createSplineApp } from '@/lib/spline-loader';

interface SplineLoaderProps {
  className?: string;
}

export const SplineLoader = memo(function SplineLoader({ className = "" }: SplineLoaderProps) {
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
        app = await createSplineApp(canvasRef.current, 1.5); // Lower DPR for loader

        if (canceled) {
          app.destroy?.();
          return;
        }

        // Load your specific Spline scene
        await app.load('https://prod.spline.design/e3edlM-UvyG2xiRK/scene.splinecode');

        if (!canceled) {
          appRef.current = app;
          setIsLoading(false);
        } else {
          app.destroy?.();
        }
      } catch (error) {
        console.error('Failed to load Spline scene:', error);
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
          console.warn('Error destroying Spline app:', error);
        }
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`fixed inset-0 bg-tech-light z-50 flex items-center justify-center ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-tech-light">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center p-4">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-sm text-red-600 mb-2">Failed to load 3D scene</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        </div>
      )}
      
      <div className="relative w-full h-full max-w-full max-h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute top-1/2 left-1/2 block outline-none"
          style={{
            transform: "translate(-50%, -50%)",
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            maxHeight: "100vh",
            objectFit: "contain",
            background: "transparent",
            display: "block",
            minWidth: '1px',
            minHeight: '1px'
          }}
        />
      </div>
    </div>
  );
});