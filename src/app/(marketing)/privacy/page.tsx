import Link from "next/link";
import { FormlyLogo } from "@/components/brand/FormlyLogo";

export const metadata = {
  title: "Privacy Policy — Formly",
  description: "How Formly collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0F4C8F] px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="inline-block mb-8">
            <FormlyLogo size="sm" variant="white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-2 text-blue-200 text-sm">Last updated: June 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12 prose prose-gray prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 max-w-none">

        <p className="text-gray-600 text-base leading-relaxed">
          Formly, Inc. ("Formly," "we," "our," or "us") operates the Formly platform, which connects Meta
          Instant Forms to ServiceTitan for real-time lead routing. This Privacy Policy explains how we
          collect, use, disclose, and protect information about you when you use our website at formly.app
          and our SaaS platform (collectively, the "Service").
        </p>
        <p className="text-gray-600 text-base leading-relaxed">
          By using the Service you agree to this policy. If you do not agree, please discontinue use.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">1. Information We Collect</h2>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">1.1 Information You Provide</h3>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li><strong>Account information:</strong> name, email address, and password when you create an account.</li>
          <li><strong>Billing information:</strong> payment card details processed by Stripe (we never store raw card numbers).</li>
          <li><strong>Integration credentials:</strong> OAuth tokens for Meta and ServiceTitan that you authorize.</li>
          <li><strong>Brand settings:</strong> logo, colors, and other visual assets you upload.</li>
          <li><strong>Support communications:</strong> messages and attachments you send to our support team.</li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">1.2 Lead Data Processed on Your Behalf</h3>
        <p className="text-gray-600">
          When you connect Meta Instant Forms, Formly receives lead data that your ad respondents submitted,
          including names, phone numbers, email addresses, and any custom fields you configured in your Meta
          form. This data is processed as a service to you (the data controller) and is governed by your own
          privacy notices to your customers.
        </p>

        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">1.3 Automatically Collected Data</h3>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li><strong>Log data:</strong> IP address, browser type, pages visited, and timestamps.</li>
          <li><strong>Cookies:</strong> session cookies required for authentication and preferences. See Section 6.</li>
          <li><strong>Usage analytics:</strong> anonymized feature-usage data to improve the platform.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li>Provide, maintain, and improve the Service.</li>
          <li>Process and route lead data from Meta to ServiceTitan per your campaign configuration.</li>
          <li>Send transactional emails (lead notifications, email templates) on your behalf.</li>
          <li>Fire Conversions API (CAPI) signals to Meta as you configure.</li>
          <li>Respond to support requests and communicate service updates.</li>
          <li>Detect and prevent fraud, abuse, and security incidents.</li>
          <li>Comply with legal obligations.</li>
        </ul>
        <p className="text-gray-600">
          We do not sell your personal information or your customers' lead data to third parties.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">3. Sharing of Information</h2>
        <p className="text-gray-600">We share information only in these limited circumstances:</p>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li>
            <strong>Meta (Facebook):</strong> We send CAPI conversion events and receive lead data via the
            Meta Graph API under your authorization. Meta's use of this data is governed by
            Meta's own Privacy Policy.
          </li>
          <li>
            <strong>ServiceTitan:</strong> We forward lead data to your ServiceTitan tenant to create
            bookings or jobs per your configuration.
          </li>
          <li>
            <strong>Infrastructure providers:</strong> Railway (hosting), Neon (database), Resend (email
            delivery), and Stripe (payments) — each under data processing agreements.
          </li>
          <li>
            <strong>Legal requirements:</strong> If required by law, court order, or to protect the rights
            and safety of Formly or the public.
          </li>
          <li>
            <strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of
            assets, with notice to affected users.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">4. Data Retention</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li><strong>Account data:</strong> retained while your account is active and for 90 days after deletion.</li>
          <li><strong>Lead data:</strong> retained for 12 months from the date the lead was received, then purged.</li>
          <li><strong>CAPI events:</strong> retained for 90 days, after which only aggregated metrics are kept.</li>
          <li><strong>Log data:</strong> retained for 30 days for security and debugging purposes.</li>
        </ul>
        <p className="text-gray-600">
          You may request earlier deletion by contacting us at{" "}
          <a href="mailto:privacy@formly.app" className="text-[#0F4C8F] hover:underline">privacy@formly.app</a>.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">5. Your Rights</h2>
        <p className="text-gray-600">
          Depending on your location, you may have the following rights regarding your personal information:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
          <li><strong>Correction:</strong> request correction of inaccurate data.</li>
          <li><strong>Deletion:</strong> request deletion of your personal data (subject to legal retention obligations).</li>
          <li><strong>Portability:</strong> receive your data in a machine-readable format.</li>
          <li><strong>Objection/Restriction:</strong> object to or request restriction of certain processing.</li>
          <li><strong>Withdraw consent:</strong> where processing is based on consent, you may withdraw at any time.</li>
        </ul>
        <p className="text-gray-600">
          To exercise any of these rights, email{" "}
          <a href="mailto:privacy@formly.app" className="text-[#0F4C8F] hover:underline">privacy@formly.app</a>.
          We will respond within 30 days.
        </p>
        <p className="text-gray-600">
          <strong>California residents (CCPA):</strong> You have the right to know, delete, and opt-out of
          the sale of personal information. We do not sell personal information. To submit a request, email
          the address above.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">6. Cookies</h2>
        <p className="text-gray-600">
          Formly uses essential cookies only:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li>
            <strong>Session cookie (next-auth.session-token):</strong> keeps you logged in. Expires when
            you close your browser or after 30 days if you select "Remember me."
          </li>
          <li>
            <strong>CSRF cookie (next-auth.csrf-token):</strong> protects against cross-site request
            forgery attacks.
          </li>
        </ul>
        <p className="text-gray-600">
          We do not use advertising cookies or third-party tracking cookies. You can disable cookies in
          your browser settings, but doing so will prevent you from signing in.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">7. Security</h2>
        <p className="text-gray-600">
          We implement industry-standard safeguards including TLS encryption in transit, bcrypt password
          hashing, database-level encryption at rest, and least-privilege access controls. OAuth tokens
          are stored encrypted. No method of transmission or storage is 100% secure; we cannot guarantee
          absolute security.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">8. International Transfers</h2>
        <p className="text-gray-600">
          Formly is operated from the United States. If you access the Service from outside the US, your
          information may be transferred to and processed in the US. By using the Service you consent to
          this transfer. Where required, we rely on Standard Contractual Clauses for transfers from the
          European Economic Area.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">9. Children's Privacy</h2>
        <p className="text-gray-600">
          The Service is not directed to children under 13. We do not knowingly collect personal
          information from children. If you believe we have inadvertently collected such information,
          contact us immediately.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">10. Changes to This Policy</h2>
        <p className="text-gray-600">
          We may update this policy from time to time. When we make material changes we will notify you
          by email or by posting a prominent notice in the dashboard at least 14 days before the changes
          take effect. Continued use after the effective date constitutes acceptance.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">11. Contact Us</h2>
        <p className="text-gray-600">
          For privacy-related questions or requests:
        </p>
        <div className="bg-gray-50 rounded-lg p-5 text-gray-600 text-sm space-y-1">
          <p><strong>Formly, Inc.</strong></p>
          <p>Attn: Privacy Team</p>
          <p>
            Email:{" "}
            <a href="mailto:privacy@formly.app" className="text-[#0F4C8F] hover:underline">
              privacy@formly.app
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50 py-8">
        <div className="mx-auto max-w-3xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Formly. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
