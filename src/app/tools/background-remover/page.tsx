import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import BackgroundRemoverTool from "./BackgroundRemoverTool";

export const metadata: Metadata = {
  title: "Background Remover",
  description: "Remove image backgrounds instantly",
};

export default function BackgroundRemoverPage() {
  return (
    <ToolLayout
      title="Background Remover"
      description="Remove image backgrounds instantly"
      category="Image Tools"
    >
      <BackgroundRemoverTool />
    </ToolLayout>
  );
}
