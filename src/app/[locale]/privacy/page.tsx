import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.privacy" });
  const baseUrl = "https://toollo.org";
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical:
        locale === "en"
          ? `${baseUrl}/privacy`
          : `${baseUrl}/${locale}/privacy`,
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.privacy");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {t("lastUpdated")}
      </p>

      <div className="mt-8 space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white">{t("overviewTitle")}</h2>
          <p className="mt-2">{t("overviewContent")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("noCollectTitle")}</h2>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            <li>{t("noCollect1")}</li>
            <li>{t("noCollect2")}</li>
            <li>{t("noCollect3")}</li>
            <li>{t("noCollect4")}</li>
            <li>{t("noCollect5")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("thirdPartyTitle")}</h2>
          <p className="mt-2">
            {t("thirdPartyContent")}
          </p>
          <p className="mt-2">
            {t("thirdPartyOptOut")}{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              {t("thirdPartyLink")}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("analyticsTitle")}</h2>
          <p className="mt-2">{t("analyticsContent")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("networkTitle")}</h2>
          <p className="mt-2">{t("networkContent")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">{t("contactTitle")}</h2>
          <p className="mt-2">
            {t("contactContent")}{" "}
            <a
              href="mailto:privacy@toollo.org"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              privacy@toollo.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
