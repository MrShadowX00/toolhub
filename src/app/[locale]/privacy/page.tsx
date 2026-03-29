import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://toollo.org";
  return {
    title: "Privacy Policy",
    description:
      "Toollo privacy policy. We don't collect personal data. All tools run client-side in your browser.",
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">
        Last updated: March 2026
      </p>

      <div className="mt-8 space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white">Overview</h2>
          <p className="mt-2">
            Toollo (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed
            to protecting your privacy. All our tools run entirely in your
            browser — your files and data never leave your device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">
            Data We Do NOT Collect
          </h2>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            <li>We do not collect personal information</li>
            <li>We do not upload your files to any server</li>
            <li>We do not track your tool usage</li>
            <li>We do not use cookies for tracking</li>
            <li>We do not sell any data to third parties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">
            Third-Party Services
          </h2>
          <p className="mt-2">
            We use Google AdSense to display advertisements. Google may use
            cookies to serve ads based on your prior visits to this or other
            websites. You can opt out of personalized advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Google Ads Settings
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">
            Analytics
          </h2>
          <p className="mt-2">
            We may use privacy-friendly analytics to understand general usage
            patterns. This data is anonymized and cannot be used to identify
            individual users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">
            Network Tools Disclaimer
          </h2>
          <p className="mt-2">
            Some network tools (DNS Lookup, WHOIS, HTTP Headers, etc.) make
            requests to external APIs to fetch publicly available data. These
            requests pass through our server but we do not log or store the
            queries or results.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, please contact us
            at{" "}
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
