// src/components/llm.tsx
import React, { memo } from "react";
import { SplineScene } from "./SplineScene";

interface MLLMMProps {
  className?: string;
}

export const MLLMM = memo(function MLLMM({ className = "" }: MLLMMProps) {
  return (
    <SplineScene
      className={{className}}
      sceneUrl="https://prod.spline.design/igDIeIuXWbuegzCZ/scene.splinecode"
      maxDpr={1.75}
    />
  );
});
