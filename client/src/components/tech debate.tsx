// src/components/tech debate.tsx
import React, { memo } from "react";
import { SplineScene } from "./SplineScene";

interface TechDebateProps {
  className?: string;
}

export const TechDebate = memo(function TechDebate({ className = "" }: TechDebateProps) {
  return (
    <SplineScene
      className={{className}}
      sceneUrl="https://prod.spline.design/D82kvQ0WuAUrUKl2/scene.splinecode"
      maxDpr={1.75}
    />
  );
});
