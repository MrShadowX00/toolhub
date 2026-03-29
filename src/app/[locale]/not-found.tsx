import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-extrabold text-gray-800">
        {t("notFound.code")}
      </h1>
      <h2 className="mt-4 text-2xl font-bold text-white">
        {t("notFound.title")}
      </h2>
      <p className="mt-2 max-w-md text-gray-400">
        {t("notFound.description")}
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          {t("notFound.backHome")}
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {t("searchPlaceholder")}
        </Link>
      </div>
    </div>
  );
}
