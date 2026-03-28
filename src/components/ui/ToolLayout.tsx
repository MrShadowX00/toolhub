import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ToolCategory, categoryConfig } from "@/lib/tools";
import AdBanner from "@/components/layout/AdBanner";

interface ToolLayoutProps {
  title: string;
  description: string;
  category: ToolCategory;
  children: React.ReactNode;
}

export default function ToolLayout({
  title,
  description,
  category,
  children,
}: ToolLayoutProps) {
  const config = categoryConfig[category];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="transition-colors hover:text-white">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className={config.color}>{category}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-white">{title}</span>
      </nav>

      <div className="flex gap-8">
        {/* Left ad - desktop only */}
        <aside className="hidden shrink-0 xl:block">
          <div className="sticky top-24">
            <AdBanner format="rectangle" />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-gray-400">{description}</p>
          </div>
          {children}
        </main>

        {/* Right ad - desktop only */}
        <aside className="hidden shrink-0 xl:block">
          <div className="sticky top-24">
            <AdBanner format="rectangle" />
          </div>
        </aside>
      </div>

      {/* Bottom ad - mobile */}
      <div className="mt-8 xl:hidden">
        <AdBanner format="horizontal" />
      </div>
    </div>
  );
}
