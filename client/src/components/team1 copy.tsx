import { memo, useEffect, useRef } from 'react';

interface Team2Props {
  className?: string;
}

export const Team2 = memo(function Team2({ className = "" }: Team2Props) {
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
        await app.load('https://prod.spline.design/CTK3CIcegTCQoz47/scene.splinecode');

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
    <div className={`fixed inset-0 bg-tech-light z-50 flex items-center justify-center ${className}`}>
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
          }}
        />
      </div>
    </div>
  );
});