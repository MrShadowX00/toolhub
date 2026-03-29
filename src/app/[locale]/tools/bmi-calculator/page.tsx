import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd } from "@/lib/structured-data";
import BmiCalculatorTool from "./BmiCalculatorTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("bmi-calculator", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["bmi-calculator"];
  const name = toolSeo?.title || "Bmi Calculator";
  const description = toolSeo?.description || "";
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("bmi-calculator", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Calculators", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/bmi-calculator" : `https://toollo.org/${locale}/tools/bmi-calculator` },
      ])} />
      <ToolLayout toolId="bmi-calculator" category="Calculators">
        <BmiCalculatorTool />
      </ToolLayout>
    </>
  );
}
