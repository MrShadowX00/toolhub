"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ToolCard from "@/components/ui/ToolCard";
import { tools, categories, categoryConfig, getToolsByCategory } from "@/lib/tools";

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredTools = search
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Free Online Tools —{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Fast &amp; Private
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
          50+ tools. No signup. No tracking. Everything runs in your browser.
        </p>

        {/* Search */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search tools... (e.g. JSON, image, QR)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900 py-3.5 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Search Results */}
      {filteredTools ? (
        <section className="pb-16">
          <h2 className="mb-6 text-lg font-semibold text-white">
            {filteredTools.length} result{filteredTools.length !== 1 && "s"} for
            &ldquo;{search}&rdquo;
          </h2>
          {filteredTools.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  title={tool.name}
                  description={tool.description}
                  icon={tool.icon}
                  href={tool.href}
                  category={tool.category}
                  isNew={tool.isNew}
                  isPopular={tool.isPopular}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No tools found. Try a different search term.
            </p>
          )}
        </section>
      ) : (
        /* Categories */
        <section className="space-y-16 pb-20">
          {categories.map((category) => {
            const config = categoryConfig[category];
            const categoryTools = getToolsByCategory(category);

            return (
              <div
                key={category}
                id={category.toLowerCase().replace(/\s+/g, "-")}
              >
                <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                  <span>{config.emoji}</span>
                  {category}
                  <span className="ml-2 rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                    {categoryTools.length}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      title={tool.name}
                      description={tool.description}
                      icon={tool.icon}
                      href={tool.href}
                      category={tool.category}
                      isNew={tool.isNew}
                      isPopular={tool.isPopular}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
