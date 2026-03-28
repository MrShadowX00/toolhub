import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import ImageConverterTool from "./ImageConverterTool";

export const metadata: Metadata = {
  title: "Image Converter",
  description: "Convert between PNG, JPG, WebP, AVIF",
};

export default function ImageConverterPage() {
  return (
    <ToolLayout
      title="Image Converter"
      description="Convert between PNG, JPG, WebP, AVIF"
      category="Image Tools"
    >
      <ImageConverterTool />
    </ToolLayout>
  );
}
