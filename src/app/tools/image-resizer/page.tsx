import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import ImageResizerTool from "./ImageResizerTool";

export const metadata: Metadata = {
  title: "Image Resizer",
  description: "Resize images to exact dimensions",
};

export default function ImageResizerPage() {
  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images to exact dimensions"
      category="Image Tools"
    >
      <ImageResizerTool />
    </ToolLayout>
  );
}
