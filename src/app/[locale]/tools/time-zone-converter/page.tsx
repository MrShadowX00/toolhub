import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd } from "@/lib/structured-data";
import TimeZoneConverterTool from "./TimeZoneConverterTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("time-zone-converter", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["time-zone-converter"];
  const name = toolSeo?.title || "Time Zone Converter";
  const description = toolSeo?.description || "";
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("time-zone-converter", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Calculators", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/time-zone-converter" : `https://toollo.org/${locale}/tools/time-zone-converter` },
      ])} />
      <ToolLayout toolId="time-zone-converter" category="Calculators">
        <TimeZoneConverterTool />
      </ToolLayout>
    </>
  );
}
