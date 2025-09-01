// src/components/quiz.tsx
import React, { memo } from "react";
import { SplineScene } from "./SplineScene";

interface BuzzQuizProps {
  className?: string;
}

export const BuzzQuiz = memo(function BuzzQuiz({ className = "" }: BuzzQuizProps) {
  return (
    <SplineScene
      className={{className}}
      sceneUrl="https://prod.spline.design/xbTsV82bm4xhiDri/scene.splinecode"
      maxDpr={1.75}
    />
  );
});
