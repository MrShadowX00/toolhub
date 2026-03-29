"use client";

import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("pages");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
        <p className="text-sm text-gray-400">{t("loading")}</p>
      </div>
    </div>
  );
}
