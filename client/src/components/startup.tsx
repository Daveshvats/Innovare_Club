// src/components/startup.tsx
import React, { memo } from "react";
import { SplineScene } from "./SplineScene";

interface StartUpProps {
  className?: string;
}

export const StartUp = memo(function StartUp({ className = "" }: StartUpProps) {
  return (
    <SplineScene
      className={{className}}
      sceneUrl="https://prod.spline.design/r8XEjn9WlpwRm3DU/scene.splinecode"
      maxDpr={1.75}
    />
  );
});
