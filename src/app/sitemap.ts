import type { MetadataRoute } from "next";
import { locales, type Locale } from "@/i18n/config";
import { tools } from "@/lib/tools";

const baseUrl = "https://toollo.org";

function getLocalePath(locale: Locale, path: string = ""): string {
  if (locale === "en") {
    return `${baseUrl}${path}`;
  }
  return `${baseUrl}/${locale}${path}`;
}

function getAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = getLocalePath(locale, path);
  }
  return alternates;
}

// Tools that are popular or frequently updated get higher priority
const popularToolIds = new Set([
  "image-compressor",
  "image-converter",
  "background-remover",
  "json-formatter",
  "hash-generator",
  "regex-tester",
  "mortgage-calculator",
  "qr-generator",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Home page - highest priority
  entries.push({
    url: baseUrl,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
    alternates: {
      languages: getAlternates(""),
    },
  });

  // Tool pages with differentiated priorities
  for (const tool of tools) {
    const toolPath = `/tools/${tool.id}`;
    const isPopular = popularToolIds.has(tool.id);

    entries.push({
      url: `${baseUrl}${toolPath}`,
      lastModified: now,
      changeFrequency: isPopular ? "weekly" : "monthly",
      priority: isPopular ? 0.9 : 0.7,
      alternates: {
        languages: getAlternates(toolPath),
      },
    });
  }

  return entries;
}
