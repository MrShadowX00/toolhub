import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import ImageToPdfTool from "./ImageToPdfTool";

export const metadata: Metadata = {
  title: "Image to PDF",
  description: "Create PDF from images",
};

export default function ImageToPdfPage() {
  return (
    <ToolLayout
      title="Image to PDF"
      description="Create PDF from images"
      category="Image Tools"
    >
      <ImageToPdfTool />
    </ToolLayout>
  );
}
