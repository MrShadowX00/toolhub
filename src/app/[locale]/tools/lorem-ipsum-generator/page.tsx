import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";
import LoremIpsumGeneratorTool from "./LoremIpsumGeneratorTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("lorem-ipsum-generator", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["lorem-ipsum-generator"];
  const name = toolSeo?.title || "Lorem Ipsum Generator";
  const description = toolSeo?.description || "";
  const faq = toolSeo?.faq || [];
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("lorem-ipsum-generator", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Generators", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/lorem-ipsum-generator" : `https://toollo.org/${locale}/tools/lorem-ipsum-generator` },
      ])} />
      {faq.length > 0 && <JsonLd data={getFaqJsonLd(faq)} />}
      <ToolLayout toolId="lorem-ipsum-generator" category="Generators" faq={faq}>
        <LoremIpsumGeneratorTool />
      </ToolLayout>
    </>
  );
}
