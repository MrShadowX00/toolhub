import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd } from "@/lib/structured-data";
import SitemapGeneratorTool from "./SitemapGeneratorTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("sitemap-generator", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["sitemap-generator"];
  const name = toolSeo?.title || "Sitemap Generator";
  const description = toolSeo?.description || "";
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("sitemap-generator", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Network Tools", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/sitemap-generator" : `https://toollo.org/${locale}/tools/sitemap-generator` },
      ])} />
      <ToolLayout toolId="sitemap-generator" category="Network Tools">
        <SitemapGeneratorTool />
      </ToolLayout>
    </>
  );
}
