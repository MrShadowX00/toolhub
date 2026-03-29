"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { ToolCategory, categoryConfig } from "@/lib/tools";

interface ToolCardProps {
  toolId: string;
  icon: LucideIcon;
  href: string;
  category: ToolCategory;
  isNew?: boolean;
  isPopular?: boolean;
}

export default function ToolCard({
  toolId,
  icon: Icon,
  href,
  category,
  isNew,
  isPopular,
}: ToolCardProps) {
  const config = categoryConfig[category];
  const t = useTranslations("common");
  const tt = useTranslations("tools");

  const toolName = tt(`${toolId}.name`);
  const toolDescription = tt(`${toolId}.description`);

  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all hover:border-gray-700 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-indigo-500/5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
      aria-label={`${toolName} — ${toolDescription}`}
    >
      {(isNew || isPopular) && (
        <span
          className={clsx(
            "absolute end-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            isNew && "bg-emerald-500/10 text-emerald-400",
            isPopular && !isNew && "bg-amber-500/10 text-amber-400"
          )}
          aria-label={isNew ? t("new") : t("popular")}
        >
          {isNew ? t("new") : t("popular")}
        </span>
      )}

      <div
        className={clsx(
          "mb-3 inline-flex rounded-lg p-2.5",
          config.bgColor
        )}
        aria-hidden="true"
      >
        <Icon className={clsx("h-5 w-5", config.color)} />
      </div>

      <h3 className="mb-1 text-sm font-semibold text-white transition-colors group-hover:text-indigo-400">
        {toolName}
      </h3>
      <p className="text-xs leading-relaxed text-gray-500">
        {toolDescription}
      </p>
    </Link>
  );
}
