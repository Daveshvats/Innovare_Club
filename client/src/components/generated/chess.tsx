import { memo, useRef, useEffect } from "react";

interface ChessProps {
  className?: string;
}

export const Chess = memo(function Chess({ className = "" }: ChessProps) {
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
        const module = await import('https://unpkg.com/@splinetool/runtime@1.10.56/build/runtime.js');
        Application = module.Application;

        // Initialize the 3D app on the canvas
        app = new Application(canvasRef.current);

        // Load the Spline scene for Chess
        await app.load('https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?cs=srgb&dl=pexels-pixabay-260024.jpg&fm=jpg');

        appRef.current = app;
      } catch (error) {
        console.error('Failed to load Chess Spline scene:', error);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        try {
          appRef.current.destroy?.();
        } catch (error) {
          console.warn('Error destroying Chess Spline app:', error);
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
