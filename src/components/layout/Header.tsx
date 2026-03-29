"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Zap, Search, ChevronDown, X, Menu } from "lucide-react";
import { categories, categoryConfig } from "@/lib/tools";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const t = useTranslations("common");
  const tt = useTranslations("tools");

  const closeAll = useCallback(() => {
    setShowCategories(false);
    setShowSearch(false);
    setShowMobileMenu(false);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Toollo - Home"
          onClick={closeAll}
        >
          <Zap className="h-6 w-6 text-indigo-500" aria-hidden="true" />
          <span className="text-xl font-bold text-white">Toollo</span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
              aria-expanded={showCategories}
              aria-haspopup="true"
            >
              {t("categories")}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showCategories ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {showCategories && (
              <>
                <div
                  className="fixed inset-0"
                  onClick={() => setShowCategories(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute start-0 top-full mt-2 w-56 rounded-lg border border-gray-800 bg-gray-900 p-2 shadow-xl"
                  role="menu"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/#${cat.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                      role="menuitem"
                    >
                      <span aria-hidden="true">{categoryConfig[cat].emoji}</span>
                      {tt(`categories.${cat}`)}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          {showSearch ? (
            <div className="flex items-center gap-2">
              <input
                type="search"
                placeholder={t("searchPlaceholder")}
                autoFocus
                className="w-48 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                aria-label="Search tools"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close search"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          <LanguageSwitcher />

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white md:hidden"
            aria-label="Toggle menu"
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <nav
          className="border-t border-gray-800 bg-gray-950 p-4 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/#${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={closeAll}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <span aria-hidden="true">{categoryConfig[cat].emoji}</span>
                {tt(`categories.${cat}`)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
