import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import SvgToPngTool from "./SvgToPngTool";

export const metadata: Metadata = {
  title: "SVG to PNG",
  description: "Convert SVG vectors to PNG",
};

export default function SvgToPngPage() {
  return (
    <ToolLayout
      title="SVG to PNG"
      description="Convert SVG vectors to PNG"
      category="Image Tools"
    >
      <SvgToPngTool />
    </ToolLayout>
  );
}
