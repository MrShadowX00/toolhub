import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";
import TdeeCalculatorTool from "./TdeeCalculatorTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("tdee-calculator", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["tdee-calculator"];
  const name = toolSeo?.title || "TDEE Calculator";
  const description = toolSeo?.description || "";
  const faq = toolSeo?.faq || [];
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("tdee-calculator", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Calculators", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/tdee-calculator" : `https://toollo.org/${locale}/tools/tdee-calculator` },
      ])} />
      {faq.length > 0 && <JsonLd data={getFaqJsonLd(faq)} />}
      <ToolLayout toolId="tdee-calculator" category="Calculators" faq={faq}>
        <TdeeCalculatorTool />
      </ToolLayout>
    </>
  );
}
