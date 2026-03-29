import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";
import { ToolCategory, categoryConfig } from "@/lib/tools";
import AdBanner from "@/components/layout/AdBanner";

interface ToolLayoutProps {
  toolId: string;
  category: ToolCategory;
  children: React.ReactNode;
}

export default function ToolLayout({
  toolId,
  category,
  children,
}: ToolLayoutProps) {
  const config = categoryConfig[category];
  const t = useTranslations("common");
  const tt = useTranslations("tools");

  const toolName = tt(`${toolId}.name`);
  const toolDescription = tt(`${toolId}.description`);
  const categoryName = tt(`categories.${category}`);

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

          {/* In-article ad after tool content */}
          <div className="mt-8">
            <AdBanner format="in-article" responsive />
          </div>
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
