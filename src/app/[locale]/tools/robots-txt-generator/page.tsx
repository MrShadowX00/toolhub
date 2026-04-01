import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";
import RobotsTxtGeneratorTool from "./RobotsTxtGeneratorTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("robots-txt-generator", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["robots-txt-generator"];
  const name = toolSeo?.title || "Robots.txt Generator";
  const description = toolSeo?.description || "";
  const faq = toolSeo?.faq || [];
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("robots-txt-generator", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Network Tools", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/robots-txt-generator" : `https://toollo.org/${locale}/tools/robots-txt-generator` },
      ])} />
      {faq.length > 0 && <JsonLd data={getFaqJsonLd(faq)} />}
      <ToolLayout toolId="robots-txt-generator" category="Network Tools" faq={faq}>
        <RobotsTxtGeneratorTool />
      </ToolLayout>
    </>
  );
}
