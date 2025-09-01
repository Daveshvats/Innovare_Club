// src/components/SuitPursuit.tsx
import React, { memo } from "react";
import { SplineScene } from "./SplineScene";

interface SuitPursuitProps {
  className?: string;
}

export const SuitPursuit = memo(function SuitPursuit({ className = "" }: SuitPursuitProps) {
  return (
    <SplineScene
      className={{className}}
      sceneUrl="https://prod.spline.design/N5KWfoFEi1dBayTl/scene.splinecode"
      maxDpr={1.75}
    />
  );
});
