import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";
import DiscountCalculatorTool from "./DiscountCalculatorTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("discount-calculator", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["discount-calculator"];
  const name = toolSeo?.title || "Discount Calculator";
  const description = toolSeo?.description || "";
  const faq = toolSeo?.faq || [];
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("discount-calculator", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Calculators", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/discount-calculator" : `https://toollo.org/${locale}/tools/discount-calculator` },
      ])} />
      {faq.length > 0 && <JsonLd data={getFaqJsonLd(faq)} />}
      <ToolLayout toolId="discount-calculator" category="Calculators" faq={faq}>
        <DiscountCalculatorTool />
      </ToolLayout>
    </>
  );
}
