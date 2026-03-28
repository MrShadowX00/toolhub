import Link from "next/link";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { ToolCategory, categoryConfig } from "@/lib/tools";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: ToolCategory;
  isNew?: boolean;
  isPopular?: boolean;
}

export default function ToolCard({
  title,
  description,
  icon: Icon,
  href,
  category,
  isNew,
  isPopular,
}: ToolCardProps) {
  const config = categoryConfig[category];

  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all hover:border-gray-700 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      {(isNew || isPopular) && (
        <span
          className={clsx(
            "absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            isNew && "bg-emerald-500/10 text-emerald-400",
            isPopular && !isNew && "bg-amber-500/10 text-amber-400"
          )}
        >
          {isNew ? "New" : "Popular"}
        </span>
      )}

      <div
        className={clsx(
          "mb-3 inline-flex rounded-lg p-2.5",
          config.bgColor
        )}
      >
        <Icon className={clsx("h-5 w-5", config.color)} />
      </div>

      <h3 className="mb-1 text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>
      <p className="text-xs leading-relaxed text-gray-500">{description}</p>
    </Link>
  );
}
