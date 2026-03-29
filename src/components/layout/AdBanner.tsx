"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

interface AdBannerProps {
  slot?: string;
  format?: "horizontal" | "rectangle" | "square" | "in-article";
  className?: string;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export default function AdBanner({
  slot = "",
  format = "horizontal",
  className,
  responsive = true,
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  const sizeClasses = {
    horizontal: "min-h-[90px] w-full",
    rectangle: "min-h-[250px] w-[300px]",
    square: "min-h-[250px] w-[250px]",
    "in-article": "min-h-[250px] w-full",
  };

  const layoutMap = {
    horizontal: "in-article",
    rectangle: "in-article",
    square: "in-article",
    "in-article": "in-article",
  };

  if (!slot) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center rounded-lg border border-dashed border-gray-800 bg-gray-900/50 text-xs text-gray-600",
          sizeClasses[format],
          className
        )}
        aria-hidden="true"
      >
        Ad Space
      </div>
    );
  }

  return (
    <div className={clsx("ad-container overflow-hidden", className)} aria-hidden="true">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7668896830420502"
        data-ad-slot={slot}
        data-ad-format={responsive ? "auto" : layoutMap[format]}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
