import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { ToolCategory, categoryConfig, getToolsByCategory } from "@/lib/tools";
import AdBanner from "@/components/layout/AdBanner";

interface FaqItem {
  q: string;
  a: string;
}

interface ToolLayoutProps {
  toolId: string;
  category: ToolCategory;
  children: React.ReactNode;
  faq?: FaqItem[];
}

export default function ToolLayout({
  toolId,
  category,
  children,
  faq,
}: ToolLayoutProps) {
  const config = categoryConfig[category];
  const t = useTranslations("common");
  const tt = useTranslations("tools");

  const toolName = tt(`${toolId}.name`);
  const toolDescription = tt(`${toolId}.description`);
  const categoryName = tt(`categories.${category}`);

  const relatedTools = getToolsByCategory(category)
    .filter((t) => t.id !== toolId)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500"
      >
        <Link href="/" className="transition-colors hover:text-white">
          {t("home")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className={config.color}>{categoryName}</span>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-white">{toolName}</span>
      </nav>

      {/* Top ad - visible on all screens */}
      <div className="mb-6">
        <AdBanner format="horizontal" responsive />
      </div>

      <div className="flex gap-8">
        {/* Left ad - desktop only */}
        <aside className="hidden shrink-0 xl:block" aria-label="Advertisement">
          <div className="sticky top-24">
            <AdBanner format="rectangle" />
          </div>
        </aside>

        {/* Main content */}
        <article className="min-w-0 flex-1">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">{toolName}</h1>
            <p className="mt-2 text-gray-400">{toolDescription}</p>
          </header>

          <section>{children}</section>

          {/* FAQ Section */}
          {faq && faq.length > 0 && (
            <section className="mt-10 border-t border-gray-800 pt-8" aria-label="FAQ">
              <h2 className="mb-4 text-lg font-semibold text-white">
                FAQ
              </h2>
              <dl className="space-y-4">
                {faq.map((item, i) => (
                  <div key={i} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                    <dt className="font-medium text-white">{item.q}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-gray-400">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* In-article ad after tool content */}
          <div className="mt-8">
            <AdBanner format="in-article" responsive />
          </div>

          {/* Related Tools - Internal Linking */}
          {relatedTools.length > 0 && (
            <nav className="mt-12 border-t border-gray-800 pt-8" aria-label="Related tools">
              <h2 className="mb-4 text-lg font-semibold text-white">
                {t("relatedTools")}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className="group rounded-lg border border-gray-800 bg-gray-900 p-4 transition-all hover:border-gray-700 hover:bg-gray-800/80"
                  >
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400">
                      {tt(`${tool.id}.name`)}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {tt(`${tool.id}.description`)}
                    </p>
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </article>

        {/* Right ad - desktop only */}
        <aside className="hidden shrink-0 xl:block" aria-label="Advertisement">
          <div className="sticky top-24">
            <AdBanner format="rectangle" />
          </div>
        </aside>
      </div>

      {/* Bottom ad - mobile */}
      <div className="mt-8 xl:hidden">
        <AdBanner format="horizontal" responsive />
      </div>
    </div>
  );
}
