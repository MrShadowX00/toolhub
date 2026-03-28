import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import HeicToJpgTool from "./HeicToJpgTool";

export const metadata: Metadata = {
  title: "HEIC to JPG",
  description: "Convert iPhone HEIC photos to JPG",
};

export default function HeicToJpgPage() {
  return (
    <ToolLayout
      title="HEIC to JPG"
      description="Convert iPhone HEIC photos to JPG"
      category="Image Tools"
    >
      <HeicToJpgTool />
    </ToolLayout>
  );
}
