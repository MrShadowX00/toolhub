import type { Metadata } from "next";
import ToolLayout from "@/components/ui/ToolLayout";
import VideoToGifTool from "./VideoToGifTool";

export const metadata: Metadata = {
  title: "Video to GIF",
  description: "Convert video clips to GIF",
};

export default function VideoToGifPage() {
  return (
    <ToolLayout
      title="Video to GIF"
      description="Convert video clips to GIF"
      category="Image Tools"
    >
      <VideoToGifTool />
    </ToolLayout>
  );
}
