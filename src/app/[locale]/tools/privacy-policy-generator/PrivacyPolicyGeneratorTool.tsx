"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Copy, Download, Check } from "lucide-react";

const DATA_TYPES = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email Address" },
  { id: "phone", label: "Phone Number" },
  { id: "address", label: "Physical Address" },
  { id: "cookies", label: "Cookies" },
  { id: "analytics", label: "Analytics Data" },
  { id: "location", label: "Location Data" },
  { id: "payment", label: "Payment Information" },
  { id: "ip", label: "IP Address" },
];

const THIRD_PARTIES = [
  { id: "google-analytics", label: "Google Analytics" },
  { id: "adsense", label: "Google AdSense" },
  { id: "facebook-pixel", label: "Facebook Pixel" },
  { id: "stripe", label: "Stripe" },
  { id: "mailchimp", label: "Mailchimp" },
  { id: "cloudflare", label: "Cloudflare" },
];

export default function PrivacyPolicyGeneratorTool() {
  const t = useTranslations("toolUi");

  const [websiteName, setWebsiteName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [dataCollected, setDataCollected] = useState<string[]>(["name", "email", "cookies"]);
  const [thirdParties, setThirdParties] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const toggleData = (id: string) => {
    setDataCollected((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const toggleThirdParty = (id: string) => {
    setThirdParties((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const effectiveDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const policy = useMemo(() => {
    const name = websiteName || "[Website Name]";
    const url = websiteUrl || "[Website URL]";
    const email = contactEmail || "[contact@example.com]";
    const dataLabels = dataCollected.map((id) => DATA_TYPES.find((d) => d.id === id)?.label).filter(Boolean);
    const tpLabels = thirdParties.map((id) => THIRD_PARTIES.find((d) => d.id === id)?.label).filter(Boolean);

    let text = `PRIVACY POLICY

Last updated: ${effectiveDate}

${name} ("we", "us", or "our") operates ${url} (the "Website"). This Privacy Policy informs you of our policies regarding the collection, use, and disclosure of personal information when you use our Website.

By using the Website, you agree to the collection and use of information in accordance with this policy.

---

1. INFORMATION WE COLLECT

We collect the following types of information:
${dataLabels.map((d) => `  - ${d}`).join("\n")}
`;

    if (dataCollected.includes("cookies")) {
      text += `
2. COOKIES

We use cookies and similar tracking technologies to track activity on our Website and hold certain information. Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Website.

Types of cookies we use:
  - Essential cookies: Required for the Website to function properly.
  - Analytics cookies: Help us understand how visitors interact with the Website.
  - Preference cookies: Remember your settings and preferences.
`;
    }

    if (tpLabels.length > 0) {
      text += `
${dataCollected.includes("cookies") ? "3" : "2"}. THIRD-PARTY SERVICES

We may employ the following third-party companies and services:
${tpLabels.map((tp) => `  - ${tp}`).join("\n")}

These third parties have access to your personal information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose. Each third-party service has its own privacy policy governing the use of your data.
`;
    }

    const nextSection = (dataCollected.includes("cookies") ? 3 : 2) + (tpLabels.length > 0 ? 1 : 0);

    text += `
${nextSection}. HOW WE USE YOUR INFORMATION

We use the collected information for the following purposes:
  - To provide and maintain our Website
  - To notify you about changes to our Website
  - To allow you to participate in interactive features
  - To provide customer support
  - To gather analysis or valuable information to improve our Website
  - To monitor the usage of our Website
  - To detect, prevent, and address technical issues

${nextSection + 1}. DATA RETENTION

We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.

${nextSection + 2}. DATA SECURITY

The security of your data is important to us. We strive to use commercially acceptable means to protect your personal information, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure.

${nextSection + 3}. YOUR RIGHTS

Depending on your location, you may have the following rights regarding your personal data:
  - The right to access the personal data we hold about you
  - The right to request correction of inaccurate data
  - The right to request deletion of your data
  - The right to restrict processing of your data
  - The right to data portability
  - The right to object to processing

To exercise any of these rights, please contact us at ${email}.

${nextSection + 4}. CHILDREN'S PRIVACY

Our Website does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers.

${nextSection + 5}. CHANGES TO THIS PRIVACY POLICY

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.

You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.

${nextSection + 6}. CONTACT US

If you have any questions about this Privacy Policy, please contact us:
  - Email: ${email}
  - Website: ${url}
`;

    return text;
  }, [websiteName, websiteUrl, contactEmail, dataCollected, thirdParties, effectiveDate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(policy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const handleDownload = () => {
    const blob = new Blob([policy], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "privacy-policy.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none";
  const labelCls = "block text-sm font-medium text-gray-400 mb-1";
  const btnCls = "bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors";

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white">Website Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Website Name</label>
            <input className={inputCls} value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} placeholder="My Website" />
          </div>
          <div>
            <label className={labelCls}>Website URL</label>
            <input className={inputCls} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input className={inputCls} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="privacy@example.com" type="email" />
          </div>
        </div>

        {/* Data collected */}
        <div>
          <label className={labelCls}>Data Collected</label>
          <div className="flex flex-wrap gap-3 mt-1">
            {DATA_TYPES.map((dt) => (
              <label key={dt.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataCollected.includes(dt.id)}
                  onChange={() => toggleData(dt.id)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">{dt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Third parties */}
        <div>
          <label className={labelCls}>Third-Party Services</label>
          <div className="flex flex-wrap gap-3 mt-1">
            {THIRD_PARTIES.map((tp) => (
              <label key={tp.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={thirdParties.includes(tp.id)}
                  onChange={() => toggleThirdParty(tp.id)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">{tp.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Policy */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Generated Privacy Policy</h3>
          <div className="flex gap-2">
            <button onClick={handleCopy} className={btnCls}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={handleDownload} className={btnCls}>
              <Download size={16} /> Download
            </button>
          </div>
        </div>
        <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-300 text-sm whitespace-pre-wrap font-mono max-h-[600px] overflow-y-auto leading-relaxed">
          {policy}
        </pre>
      </div>
    </div>
  );
}
