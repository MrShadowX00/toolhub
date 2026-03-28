import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import ImageToBase64Tool from "./ImageToBase64Tool";

export const metadata: Metadata = {
  title: "Image to Base64",
  description: "Convert images to Base64 string",
};

export default function ImageToBase64Page() {
  return (
    <ToolLayout
      title="Image to Base64"
      description="Convert images to Base64 string"
      category="Image Tools"
    >
      <ImageToBase64Tool />
    </ToolLayout>
  );
}
