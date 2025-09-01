// src/components/problem.tsx
import React, { memo } from "react";
import { SplineScene } from "./SplineScene";

interface ProblemSolveProps {
  className?: string;
}

export const ProblemSolve = memo(function ProblemSolve({ className = "" }: ProblemSolveProps) {
  return (
    <SplineScene
      className={{className}}
      sceneUrl="https://prod.spline.design/Nz6c8Jz7oQKvPZ5W/scene.splinecode"
      maxDpr={1.75}
    />
  );
});
