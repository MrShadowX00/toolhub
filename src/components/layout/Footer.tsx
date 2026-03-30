import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Zap, Shield } from "lucide-react";
import { categories, categoryConfig, getToolsByCategory } from "@/lib/tools";

export default function Footer() {
  const t = useTranslations("common");
  const tt = useTranslations("tools");

  return (
    <footer
      className="border-t border-gray-800 bg-gray-950"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top section: Brand + Categories + Links */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              <span className="text-lg font-bold text-white">Toollo</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              {t("privacyBadge")}
            </p>
          </div>

          {/* Tool Categories with links */}
          {categories.slice(0, 3).map((category) => {
            const config = categoryConfig[category];
            const categoryTools = getToolsByCategory(category).slice(0, 5);
            return (
              <nav key={category} aria-label={tt(`categories.${category}`)}>
                <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <span aria-hidden="true">{config.emoji}</span>
                  {tt(`categories.${category}`)}
                </h3>
                <ul className="space-y-2">
                  {categoryTools.map((tool) => (
                    <li key={tool.id}>
                      <Link
                        href={tool.href}
                        className="text-sm text-gray-500 transition-colors hover:text-white"
                      >
                        {tt(`${tool.id}.name`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <nav className="flex flex-wrap items-center gap-6" aria-label="Footer navigation">
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
              <a
                href="/sitemap.xml"
                className="text-sm text-gray-400 transition-colors hover:text-white"
                rel="noopener"
              >
                Sitemap
              </a>
            </nav>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>100% {t("privacy")}</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Toollo. {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
