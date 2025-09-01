// src/components/PermanentSplineBg.tsx
import React, { useEffect } from 'react';

const VIEWER_SRC =
  'https://unpkg.com/@splinetool/viewer@1.9.49/build/spline-viewer.js';
const BG_SCENE =
  'https://prod.spline.design/DC0L-NagpocfiwmY/scene.splinecode';

// Allow the custom element in TS projects
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { url?: string };
    }
  }
}

export function PermanentSplineBg({
  url = BG_SCENE,
  /** Lower = more vibrant; we reduced from 0.25 → 0.06 */
  tintOpacity = 0.06,
  className = '',
}: {
  url?: string;
  tintOpacity?: number;
  className?: string;
}) {
  useEffect(() => {
    // inject viewer script once
    const existing = document.querySelector('script[data-spline-viewer]');
    if (!existing) {
      const s = document.createElement('script');
      s.type = 'module';
      s.async = true;
      s.src = VIEWER_SRC;
      s.setAttribute('data-spline-viewer', '1');
      document.head.appendChild(s);
    }

    // resource hints
    const hints = [
      ['preconnect', 'https://unpkg.com'],
      ['dns-prefetch', 'https://unpkg.com'],
      ['preconnect', 'https://prod.spline.design'],
      ['dns-prefetch', 'https://prod.spline.design'],
    ] as const;

    const added: HTMLLinkElement[] = [];
    for (const [rel, href] of hints) {
      const l = document.createElement('link');
      l.rel = rel;
      l.href = href;
      if (rel === 'preconnect') l.crossOrigin = '';
      document.head.appendChild(l);
      added.push(l);
    }
    return () => added.forEach((n) => n.remove());
  }, []);

  return (
    <div className={`pointer-events-none fixed inset-0 -z-20 ${className}`}>
      <spline-viewer
        url={url}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* Softer tint so the background is more vibrant */}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${tintOpacity})` }}
      />
    </div>
  );
}
