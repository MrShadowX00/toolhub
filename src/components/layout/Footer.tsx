import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Zap, Shield } from "lucide-react";

export default function Footer() {
  const t = useTranslations("common");

  return (
    <footer
      className="border-t border-gray-800 bg-gray-950"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-500" aria-hidden="true" />
            <span className="text-lg font-bold text-white">Toollo</span>
          </div>

          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link
              href="/privacy"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              {t("terms")}
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              {t("about")}
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="h-4 w-4" aria-hidden="true" />
          <p>{t("privacyBadge")}</p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Toollo. {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
