import { memo, useEffect, useRef } from 'react';
import { createSplineApp } from '@/lib/spline-loader';

interface NavbarRobotProps {
  className?: string;
}

export const NavbarRobot = memo(function NavbarRobot({ className = "" }: NavbarRobotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

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
        await waitForCanvasSize();
        
        if (!canvasRef.current || canceled) return;

        // Use shared Spline runtime loader
        app = await createSplineApp(canvasRef.current, 1.5); // Lower DPR for navbar

        if (canceled) {
          app.destroy?.();
          return;
        }

        // Load your specific Spline scene
        await app.load('https://prod.spline.design/Ay6UN91vSyqNnyBd/scene.splinecode');

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
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block outline-none"
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
});