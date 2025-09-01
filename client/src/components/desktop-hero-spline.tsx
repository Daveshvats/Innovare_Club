// Desktop Hero Spline Component for TechFest
import React, { memo, useEffect, useRef } from 'react';

interface DesktopHeroSplineProps {
  className?: string;
}

export const DesktopHeroSpline = memo(function DesktopHeroSpline({ className = "" }: DesktopHeroSplineProps) {
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

        // Load desktop Spline scene
        await app.load('https://prod.spline.design/ienDIHj3k9pMd-zg/scene.splinecode');

        appRef.current = app;
        console.log('Desktop hero Spline scene loaded successfully');
      } catch (error) {
        console.error('Failed to load desktop hero Spline scene:', error);
      }
    }

    init();

    // Cleanup on unmount
    return () => {
      if (appRef.current) {
        try {
          appRef.current.destroy();
        } catch (error) {
          console.error('Error destroying desktop hero Spline app:', error);
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