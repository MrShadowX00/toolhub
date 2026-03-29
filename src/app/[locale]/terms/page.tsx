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
    title: "Terms of Service",
    description:
      "Toollo terms of service. Free online tools provided as-is for personal and commercial use.",
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">
        Last updated: March 2026
      </p>

      <div className="mt-8 space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white">
            Acceptance of Terms
          </h2>
          <p className="mt-2">
            By using Toollo, you agree to these terms. If you don&apos;t agree,
            please don&apos;t use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">
            Description of Service
          </h2>
          <p className="mt-2">
            Toollo provides free online tools that run in your browser. The
            tools are provided &quot;as is&quot; and &quot;as available&quot;
            without warranties of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">
            Acceptable Use
          </h2>
          <ul className="mt-2 list-disc space-y-1 ps-5">
            <li>Use the tools for lawful purposes only</li>
            <li>Do not attempt to exploit or harm our services</li>
            <li>Do not use automated systems to excessively access the tools</li>
            <li>Do not redistribute our tools as your own product</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">
            Intellectual Property
          </h2>
          <p className="mt-2">
            All content, designs, and code on Toollo are owned by us or our
            licensors. You may not copy, modify, or distribute our platform
            without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">
            Limitation of Liability
          </h2>
          <p className="mt-2">
            We are not liable for any damages arising from your use of our
            tools. All processing happens in your browser and you are
            responsible for your own data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">
            Changes to Terms
          </h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of
            Toollo after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p className="mt-2">
            Questions about these terms? Email us at{" "}
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
