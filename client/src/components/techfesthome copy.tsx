import { memo, useEffect, useRef } from 'react';

interface MobileFestHomeProps {
  className?: string;
}

export const MobileFestHome = memo(function MobileFestHome({ className = "" }: MobileFestHomeProps) {
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
        await app.load('https://prod.spline.design/AYO2dvuQ1LGfA3dM/scene.splinecode');

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
    <div className={`fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="block outline-none"
        style={{
          background: 'transparent',
          display: 'block',
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
});