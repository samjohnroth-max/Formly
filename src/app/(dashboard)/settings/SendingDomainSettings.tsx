"use client";

import { useState } from "react";
import { Copy, CheckCircle, Mail } from "lucide-react";

const DEFAULT_FROM = process.env.NEXT_PUBLIC_EMAIL_FROM ?? "noreply@formly.app";

export function SendingDomainSettings() {
  const [domain, setDomain] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const dnsRecords = domain
    ? [
        {
          key: "spf",
          type: "TXT",
          host: domain,
          value: "v=spf1 include:amazonses.com ~all",
          note: "Authorizes Resend/SES to send on your behalf",
        },
        {
          key: "dkim1",
          type: "CNAME",
          host: `resend._domainkey.${domain}`,
          value: `resend._domainkey.${domain}.dkim.resend.com`,
          note: "DKIM signature key (Resend-managed)",
        },
        {
          key: "dmarc",
          type: "TXT",
          host: `_dmarc.${domain}`,
          value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`,
          note: "DMARC policy — protects from spoofing",
        },
      ]
    : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-start gap-3 mb-5">
        <Mail className="mt-0.5 size-5 text-gray-400 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Email sending domain</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            By default, lead emails are sent from <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">{DEFAULT_FROM}</code>.
            Add your own domain to send from a branded address like{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">noreply@yourdomain.com</code>.
          </p>
        </div>
      </div>

      {!submitted ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Your domain
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase().trim())}
                placeholder="yourdomain.com"
                className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => domain && setSubmitted(true)}
                disabled={!domain}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
              >
                Show DNS records
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Add these DNS records to{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">{domain}</code>
            </p>
            <button
              onClick={() => { setSubmitted(false); setDomain(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Change domain
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Host / Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide">Value</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dnsRecords.map((rec) => (
                  <tr key={rec.key} className="bg-white">
                    <td className="px-3 py-2.5 font-mono font-semibold text-gray-700">{rec.type}</td>
                    <td className="px-3 py-2.5">
                      <code className="font-mono text-gray-700 break-all">{rec.host}</code>
                    </td>
                    <td className="px-3 py-2.5">
                      <code className="font-mono text-gray-600 break-all">{rec.value}</code>
                    </td>
                    <td className="px-2 py-2.5">
                      <button
                        onClick={() => copyToClipboard(rec.value, rec.key)}
                        title="Copy value"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copied === rec.key ? (
                          <CheckCircle className="size-3.5 text-green-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-medium text-blue-800 mb-1">After adding DNS records</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
              <li>
                Go to your{" "}
                <a
                  href="https://resend.com/domains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Resend dashboard → Domains
                </a>{" "}
                and add{" "}
                <code className="rounded bg-blue-100 px-0.5 font-mono">{domain}</code>
              </li>
              <li>Wait for DNS propagation (up to 48 hours)</li>
              <li>
                Set <code className="rounded bg-blue-100 px-0.5 font-mono">EMAIL_FROM</code> in your Railway environment to{" "}
                <code className="rounded bg-blue-100 px-0.5 font-mono">noreply@{domain}</code>
              </li>
              <li>Redeploy your app — emails will now come from your domain</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
