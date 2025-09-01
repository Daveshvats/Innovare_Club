// src/components/SplineScene.tsx
import React, { memo, useEffect, useRef } from "react";

export interface SplineSceneProps {
  className?: string;
  sceneUrl: string;
  /** Cap devicePixelRatio to reduce GPU load (default 1.75) */
  maxDpr?: number;
}

/**
 * SplineScene
 * - Dynamically loads Spline runtime from CDN when mounted
 * - Caps DPR for perf, observes resize, pauses on tab hidden
 * - Fully destroys the Spline app on unmount
 */
export const SplineScene = memo(function SplineScene({
  className = "",
  sceneUrl,
  maxDpr = 1.75,
}: SplineSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<any>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    let canceled = false;
    let removeVisibility: (() => void) | null = null;

    async function init() {
      if (!canvasRef.current) return;
      try {
        const mod = await import(
          "https://unpkg.com/@splinetool/runtime@1.10.51/build/runtime.js"
        );
        if (canceled) return;

        const { Application } = mod as { Application: any };
        const app = new Application(canvasRef.current);

        // Cap DPR for perf on hi-DPI displays
        const desired = Math.min(window.devicePixelRatio || 1, maxDpr);
        try { app.setPixelRatio?.(desired); } catch {}

        // Load scene
        await app.load(sceneUrl);
        appRef.current = app;

        // Resize observer to keep canvas sharp
        roRef.current = new ResizeObserver(() => {
          try { app.resize?.(); } catch {
            try { app.setPixelRatio?.(desired); } catch {}
          }
        });
        roRef.current.observe(canvasRef.current!);

        // Pause when tab is hidden
        const onVisibility = () => {
          try {
            if (document.hidden) app.pause?.();
            else app.play?.();
          } catch {}
        };
        document.addEventListener("visibilitychange", onVisibility);
        removeVisibility = () => document.removeEventListener("visibilitychange", onVisibility);
      } catch (err) {
        console.error("[SplineScene] Failed to init:", err);
      }
    }

    init();

    return () => {
      canceled = true;
      try { removeVisibility?.(); } catch {}
      try { roRef.current?.disconnect(); } catch {}
      roRef.current = null;

      if (appRef.current) {
        try { appRef.current.destroy?.(); } catch (e) {
          console.warn("[SplineScene] Error destroying app:", e);
        }
        appRef.current = null;
      }
    };
  }, [sceneUrl, maxDpr]);

  return (
    <div className={`relative w-full h-full rounded-2xl ${className}`}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full outline-none"
        style={{ background: "transparent" }}
      />
    </div>
  );
});
