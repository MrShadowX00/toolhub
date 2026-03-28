"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Search, ChevronDown, X } from "lucide-react";
import { categories, categoryConfig } from "@/lib/tools";

export default function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-indigo-500" />
          <span className="text-xl font-bold text-white">ToolHub</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
            >
              Categories
              <ChevronDown className="h-4 w-4" />
            </button>
            {showCategories && (
              <>
                <div
                  className="fixed inset-0"
                  onClick={() => setShowCategories(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-56 rounded-lg border border-gray-800 bg-gray-900 p-2 shadow-xl">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/#${cat.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                      <span>{categoryConfig[cat].emoji}</span>
                      {cat}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search tools..."
                autoFocus
                className="w-48 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
