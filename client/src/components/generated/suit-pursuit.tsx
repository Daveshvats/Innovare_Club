import { memo, useRef, useEffect } from "react";

interface SuitPursuitProps {
  className?: string;
}

export const SuitPursuit = memo(function SuitPursuit({ className = "" }: SuitPursuitProps) {
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

        // Load the Spline scene for SUIT PURSUIT
        await app.load('https://prod.spline.design/N5KWfoFEi1dBayTl/scene.splinecode');

        appRef.current = app;
      } catch (error) {
        console.error('Failed to load SUIT PURSUIT Spline scene:', error);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        try {
          appRef.current.destroy();
        } catch (error) {
          console.error('Error destroying SUIT PURSUIT Spline app:', error);
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
