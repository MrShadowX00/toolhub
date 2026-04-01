"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import ToolCard from "@/components/ui/ToolCard";
import AdBanner from "@/components/layout/AdBanner";
import {
  tools,
  categories,
  categoryConfig,
  getToolsByCategory,
} from "@/lib/tools";

export default function HomeClient() {
  const [search, setSearch] = useState("");
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const tt = useTranslations("tools");

  const filteredTools = useMemo(() => {
    if (!search) return null;
    const query = search.toLowerCase();
    return tools.filter((tool) => {
      const name = tt(`${tool.id}.name`).toLowerCase();
      const description = tt(`${tool.id}.description`).toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [search, tt]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="py-20 text-center" aria-labelledby="hero-title">
        <h1
          id="hero-title"
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          {t("hero.title")}{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {t("hero.titleHighlight")}
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
          {t("hero.subtitle")}
        </p>

        {/* Search */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="relative">
            <Search
              className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder={tc("searchPlaceholderLong")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 py-3.5 ps-12 pe-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              aria-label={tc("searchPlaceholder")}
              role="searchbox"
            />
          </div>
        </div>
      </section>

      {/* Top ad banner */}
      <div className="mb-8">
        <AdBanner format="horizontal" responsive />
      </div>

      {/* Search Results */}
      {filteredTools ? (
        <section className="pb-16" aria-label="Search results">
          <h2 className="mb-6 text-lg font-semibold text-white">
            {tc("resultsCount", { count: filteredTools.length, query: search })}
          </h2>
          {filteredTools.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  toolId={tool.id}
                  icon={tool.icon}
                  href={tool.href}
                  category={tool.category}
                  isNew={tool.isNew}
                  isPopular={tool.isPopular}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{tc("noResults")}</p>
          )}
        </section>
      ) : (
        /* Categories */
        <section className="space-y-16 pb-20" aria-label="Tool categories">
          {categories.map((category, catIndex) => {
            const config = categoryConfig[category];
            const categoryTools = getToolsByCategory(category);
            const categoryId = category
              .toLowerCase()
              .replace(/\s+/g, "-");

            return (
              <div key={category}>
                <div id={categoryId} className="scroll-mt-20">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                    <span aria-hidden="true">{config.emoji}</span>
                    {tt(`categories.${category}`)}
                    <span className="ms-2 rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                      {categoryTools.length}
                    </span>
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        toolId={tool.id}
                        icon={tool.icon}
                        href={tool.href}
                        category={tool.category}
                        isNew={tool.isNew}
                        isPopular={tool.isPopular}
                      />
                    ))}
                  </div>
                </div>

                {/* Ad between categories (after 2nd and 4th) */}
                {(catIndex === 1 || catIndex === 3) && (
                  <div className="mt-10">
                    <AdBanner format="horizontal" responsive />
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
