import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";
import PlagiarismCheckerTool from "./PlagiarismCheckerTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("plagiarism-checker", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["plagiarism-checker"];
  const name = toolSeo?.title || "Plagiarism Checker";
  const description = toolSeo?.description || "";
  const faq = toolSeo?.faq || [];
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("plagiarism-checker", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "AI Tools", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/plagiarism-checker" : `https://toollo.org/${locale}/tools/plagiarism-checker` },
      ])} />
      {faq.length > 0 && <JsonLd data={getFaqJsonLd(faq)} />}
      <ToolLayout toolId="plagiarism-checker" category="AI Tools" faq={faq}>
        <PlagiarismCheckerTool />
      </ToolLayout>
    </>
  );
}
