import { SplineViewer } from "@/components/spline-viewer";

export default function NotFound() {
  return (
    <div className="fixed inset-0 w-full h-full">
      <SplineViewer
        url="https://prod.spline.design/BC1aI1vmaX0APJUl/scene.splinecode"
        className="w-full h-full"
        cached={true}
      />
    </div>
  );
}
