import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import PdfToImageTool from "./PdfToImageTool";

export const metadata: Metadata = {
  title: "PDF to Image",
  description: "Convert PDF pages to images",
};

export default function PdfToImagePage() {
  return (
    <ToolLayout
      title="PDF to Image"
      description="Convert PDF pages to images"
      category="Image Tools"
    >
      <PdfToImageTool />
    </ToolLayout>
  );
}
