import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import ImageCompressorTool from "./ImageCompressorTool";

export const metadata: Metadata = {
  title: "Image Compressor",
  description: "Compress images without losing quality",
};

export default function ImageCompressorPage() {
  return (
    <ToolLayout
      title="Image Compressor"
      description="Compress images without losing quality"
      category="Image Tools"
    >
      <ImageCompressorTool />
    </ToolLayout>
  );
}
