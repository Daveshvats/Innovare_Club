import { useEffect, memo, useCallback, useRef, useState } from "react";
import { createSplineApp, waitForCanvasSize } from '@/lib/spline-loader';

interface SplineViewerProps {
  url: string;
  className?: string;
  loading?: boolean;
  cached?: boolean;
}

export const SplineViewer = memo(function SplineViewer({ 
  url, 
  className = "", 
  loading = true 
}: SplineViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let app: any;
    let canceled = false;

    async function init() {
      if (!canvasRef.current || canceled) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // Wait for canvas to have proper dimensions using shared utility
        await waitForCanvasSize(canvasRef.current);
        
        if (!canvasRef.current || canceled) return;

        // Use shared Spline runtime loader
        app = await createSplineApp(canvasRef.current, 1.75);

        if (canceled) {
          app.destroy?.();
          return;
        }

        // Load the Spline scene
        await app.load(url);

        if (!canceled) {
          appRef.current = app;
          setIsLoading(false);
        } else {
          app.destroy?.();
        }
      } catch (error) {
        console.error('Failed to load SplineViewer scene:', error);
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
          console.warn('Error destroying SplineViewer app:', error);
        }
        appRef.current = null;
      }
    };
  }, [url]);

  const containerStyle = useCallback(() => ({
    minHeight: '200px'
  }), []);

  const canvasStyle = useCallback(() => ({
    width: '100%', 
    height: '100%', 
    display: 'block',
    borderRadius: 'inherit',
    minWidth: '1px',
    minHeight: '1px'
  }), []);

  // Enable animations and interactions for navbar elements
  const isNavbar = className.includes('cursor-pointer') || className.includes('rounded-full');
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={containerStyle()}>
      {isLoading && loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-inherit">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading 3D scene...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-inherit">
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
        style={canvasStyle()}
      />
    </div>
  );
});