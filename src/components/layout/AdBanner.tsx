import clsx from "clsx";

interface AdBannerProps {
  slot?: string;
  format?: "horizontal" | "rectangle" | "square";
  className?: string;
}

export default function AdBanner({
  format = "horizontal",
  className,
}: AdBannerProps) {
  const sizeClasses = {
    horizontal: "h-24 w-full",
    rectangle: "h-64 w-72",
    square: "h-64 w-64",
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-lg border border-dashed border-gray-800 bg-gray-900/50 text-xs text-gray-600",
        sizeClasses[format],
        className
      )}
    >
      Advertisement
    </div>
  );
}
