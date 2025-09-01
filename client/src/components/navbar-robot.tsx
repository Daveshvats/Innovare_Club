import { memo, useEffect, useRef } from 'react';

interface NavbarRobotProps {
  className?: string;
}

export const NavbarRobot = memo(function NavbarRobot({ className = "" }: NavbarRobotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let Application: any;
    let app: any;

    async function init() {
      if (!canvasRef.current) return;

      try {
        // Dynamically import the Spline runtime ES module from CDN
        // @ts-ignore - Dynamic import from CDN
        const module = await import('https://unpkg.com/@splinetool/runtime@1.10.51/build/runtime.js');
        Application = module.Application;

        // Initialize the 3D app on the canvas
        app = new Application(canvasRef.current);

        // Load your specific Spline scene
        await app.load('https://prod.spline.design/Ay6UN91vSyqNnyBd/scene.splinecode');

        appRef.current = app;
      } catch (error) {
        console.error('Failed to load Spline scene:', error);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        try {
          appRef.current.destroy();
        } catch (error) {
          console.error('Error destroying Spline app:', error);
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