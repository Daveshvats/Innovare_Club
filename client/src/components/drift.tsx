// src/components/drift.tsx
import React, { memo } from "react";
import { SplineScene } from "./SplineScene";

interface DriftDraftProps {
  className?: string;
}

export const DriftDraft = memo(function DriftDraft({ className = "" }: DriftDraftProps) {
  return (
    <SplineScene
      className={{className}}
      sceneUrl="https://prod.spline.design/9ip7RU6yI67VKCrY/scene.splinecode"
      maxDpr={1.75}
    />
  );
});
