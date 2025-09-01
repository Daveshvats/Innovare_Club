// src/components/techquiz.tsx
import React, { memo } from "react";
import { SplineScene } from "./SplineScene";

interface TechQuizProps {
  className?: string;
}

export const TechQuiz = memo(function TechQuiz({ className = "" }: TechQuizProps) {
  return (
    <SplineScene
      className={{className}}
      sceneUrl="https://prod.spline.design/3jDCCDvFkRQtwp1L/scene.splinecode"
      maxDpr={1.75}
    />
  );
});
