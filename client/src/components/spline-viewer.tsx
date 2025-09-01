import { useEffect, memo, useCallback } from "react";

// Declare the spline-viewer element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': {
        url: string;
        style?: React.CSSProperties;
        'loading-anim'?: string;
        'mouse-controls'?: string;
        'preload'?: string;
      };
    }
  }
}

interface SplineViewerProps {
  url: string;
  className?: string;
  loading?: boolean;
  cached?: boolean;
}

let scriptLoaded = false;
let scriptPromise: Promise<void> | null = null;

const loadSplineScript = (): Promise<void> => {
  if (scriptLoaded) {
    return Promise.resolve();
  }
  
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="spline-viewer"]');
    if (existingScript) {
      scriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Spline viewer script'));
    };
    
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export const SplineViewer = memo(function SplineViewer({ url, className = "", loading = true }: SplineViewerProps) {
  useEffect(() => {
    loadSplineScript().catch(console.error);
  }, []);

  const containerStyle = useCallback(() => ({
    minHeight: '200px'
  }), []);

  const viewerStyle = useCallback(() => ({
    width: '100%', 
    height: '100%', 
    display: 'block',
    borderRadius: 'inherit'
  }), []);

  // Enable animations and interactions for navbar elements
  const isNavbar = className.includes('cursor-pointer') || className.includes('rounded-full');
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={containerStyle()}>
      <spline-viewer 
        url={url} 
        style={viewerStyle()}
        loading-anim={isNavbar ? "true" : "false"}
        mouse-controls={isNavbar ? "true" : "false"}
        preload="true"
      />
    </div>
  );
});
