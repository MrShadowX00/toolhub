import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.terms" });
  const baseUrl = "https://toollo.org";
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical:
        locale === "en"
          ? `${baseUrl}/terms`
          : `${baseUrl}/${locale}/terms`,
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.terms");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {t("lastUpdated")}
      </p>

      <div className="mt-8 space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white">{t("acceptTitle")}</h2>
          <p className="mt-2">{t("acceptContent")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("serviceTitle")}</h2>
          <p className="mt-2">{t("serviceContent")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("useTitle")}</h2>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            <li>{t("use1")}</li>
            <li>{t("use2")}</li>
            <li>{t("use3")}</li>
            <li>{t("use4")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("ipTitle")}</h2>
          <p className="mt-2">{t("ipContent")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("liabilityTitle")}</h2>
          <p className="mt-2">{t("liabilityContent")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("changesTitle")}</h2>
          <p className="mt-2">{t("changesContent")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("contactTitle")}</h2>
          <p className="mt-2">
            {t("contactContent")}{" "}
            <a
              href="mailto:legal@toollo.org"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              legal@toollo.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
