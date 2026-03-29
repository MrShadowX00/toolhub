import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd } from "@/lib/structured-data";
import SubnetCalculatorTool from "./SubnetCalculatorTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("subnet-calculator", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["subnet-calculator"];
  const name = toolSeo?.title || "Subnet Calculator";
  const description = toolSeo?.description || "";
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("subnet-calculator", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Calculators", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/subnet-calculator" : `https://toollo.org/${locale}/tools/subnet-calculator` },
      ])} />
      <ToolLayout toolId="subnet-calculator" category="Calculators">
        <SubnetCalculatorTool />
      </ToolLayout>
    </>
  );
}
