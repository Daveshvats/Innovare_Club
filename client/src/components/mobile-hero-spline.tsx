// Mobile Hero Spline Component for TechFest
import React, { memo, useEffect, useRef } from 'react';

interface MobileHeroSplineProps {
  className?: string;
}

export const MobileHeroSpline = memo(function MobileHeroSpline({ className = "" }: MobileHeroSplineProps) {
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

        // Load mobile Spline scene
        await app.load('https://prod.spline.design/AYO2dvuQ1LGfA3dM/scene.splinecode');

        appRef.current = app;
        console.log('Mobile hero Spline scene loaded successfully');
      } catch (error) {
        console.error('Failed to load mobile hero Spline scene:', error);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        try {
          appRef.current.destroy();
        } catch (error) {
          console.error('Error destroying mobile hero Spline app:', error);
        }
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block outline-none"
        style={{
          background: 'transparent',
          display: 'block'
        }}
      />
    </div>
  );
});