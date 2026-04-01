import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";
import AiGrammarCheckerTool from "./AiGrammarCheckerTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("ai-grammar-checker", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["ai-grammar-checker"];
  const name = toolSeo?.title || "AI Grammar Checker";
  const description = toolSeo?.description || "";
  const faq = toolSeo?.faq || [];
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("ai-grammar-checker", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "AI Tools", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/ai-grammar-checker" : `https://toollo.org/${locale}/tools/ai-grammar-checker` },
      ])} />
      {faq.length > 0 && <JsonLd data={getFaqJsonLd(faq)} />}
      <ToolLayout toolId="ai-grammar-checker" category="AI Tools" faq={faq}>
        <AiGrammarCheckerTool />
      </ToolLayout>
    </>
  );
}
