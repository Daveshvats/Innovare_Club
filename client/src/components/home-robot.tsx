import { memo, useEffect, useRef } from 'react';
import { createSplineApp } from '@/lib/spline-loader';

interface HomeRobotProps {
  className?: string;
}

export const HomeRobot = memo(function HomeRobot({ className = "" }: HomeRobotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let app: any;
    let canceled = false;

    async function init() {
      if (!canvasRef.current || canceled) return;

      try {
        // Use shared Spline runtime loader
        app = await createSplineApp(canvasRef.current, 1.75);

        if (canceled) {
          app.destroy?.();
          return;
        }

        // Load your specific Spline scene
        await app.load('https://prod.spline.design/xpETVksa9bPLWNHs/scene.splinecode');

        if (!canceled) {
          appRef.current = app;
        } else {
          app.destroy?.();
        }
      } catch (error) {
        console.error('Failed to load Spline scene:', error);
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
    <div
      className={`relative overflow-hidden rounded-2xl w-full h-64 sm:h-80 md:h-96 lg:h-[500px] ${className}`}
    >
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