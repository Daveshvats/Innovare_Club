// src/components/SuitPursuit.tsx
import React, { memo, useEffect, useRef } from "react";

/**
 * SuitPursuit
 * - Mounts exactly one Spline runtime instance on a <canvas>
 * - Dynamically imports the runtime from a CDN (keeps your bundle small)
 * - Caps DPR for perf, handles resize, pauses when tab is hidden
 * - Destroys the Spline app on unmount to free GPU + memory
 */
export interface SuitPursuitProps {
  className?: string;
  /** Optional scene URL override (defaults to your current one) */
  sceneUrl?: string;
  /** Cap devicePixelRatio to reduce GPU load (default 1.75) */
  maxDpr?: number;
}

export const SuitPursuit = memo(function SuitPursuit({
  className = "",
  sceneUrl = "https://prod.spline.design/N5KWfoFEi1dBayTl/scene.splinecode",
  maxDpr = 1.75,
}: SuitPursuitProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<any>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    let canceled = false;
    let visibilityListener: (() => void) | null = null;

    async function init() {
      if (!canvasRef.current) return;
      try {
        // Dynamically import the Spline runtime (ESM) from the CDN
        // This keeps it out of your main bundle and only loads when needed.
        const mod = await import(
          "https://unpkg.com/@splinetool/runtime@1.10.51/build/runtime.js"
        );
        if (canceled) return;

        const { Application } = mod as { Application: any };

        // Create Spline app
        const app = new Application(canvasRef.current);

        // Performance: cap DPR to reduce GPU cost on hi-DPI displays
        const desired = Math.min(window.devicePixelRatio || 1, maxDpr);
        try {
          app.setPixelRatio?.(desired);
        } catch {
          // older runtime versions may not expose setPixelRatio
        }

        // Load the scene
        await app.load(sceneUrl);

        // Save ref for cleanup
        appRef.current = app;

        // Handle resize (keep canvas sharp without relayout jank)
        roRef.current = new ResizeObserver(() => {
          try {
            app.resize?.(); // recent runtimes expose resize()
          } catch {
            // Fallback: trigger a manual size update by toggling DPR
            try {
              app.setPixelRatio?.(desired);
            } catch {
              /* noop */
            }
          }
        });
        roRef.current.observe(canvasRef.current);

        // Pause updates when tab is hidden (extra safety; browsers throttle anyway)
        const onVisibility = () => {
          try {
            if (document.hidden) app.pause?.();
            else app.play?.();
          } catch {
            /* noop */
          }
        };
        document.addEventListener("visibilitychange", onVisibility);
        visibilityListener = () =>
          document.removeEventListener("visibilitychange", onVisibility);
      } catch (err) {
        // Avoid crashing the app if the CDN or scene fails
        console.error("[SuitPursuit] Failed to init Spline:", err);
      }
    }

    init();

    return () => {
      canceled = true;

      // Stop visibility listener
      if (visibilityListener) visibilityListener();

      // Stop resize observer
      try {
        roRef.current?.disconnect();
      } catch {
        /* noop */
      }
      roRef.current = null;

      // Destroy Spline app (frees GPU/CPU/memory)
      if (appRef.current) {
        try {
          appRef.current.destroy?.();
        } catch (e) {
          console.warn("[SuitPursuit] Error destroying Spline app:", e);
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
