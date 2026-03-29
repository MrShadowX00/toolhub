import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd } from "@/lib/structured-data";
import WordCounterTool from "./WordCounterTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("word-counter", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["word-counter"];
  const name = toolSeo?.title || "Word Counter";
  const description = toolSeo?.description || "";
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("word-counter", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Generators", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/word-counter" : `https://toollo.org/${locale}/tools/word-counter` },
      ])} />
      <ToolLayout toolId="word-counter" category="Generators">
        <WordCounterTool />
      </ToolLayout>
    </>
  );
}
