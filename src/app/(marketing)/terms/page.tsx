import Link from "next/link";
import { FormlyLogo } from "@/components/brand/FormlyLogo";

export const metadata = {
  title: "Terms of Service — Formly",
  description: "Terms governing your use of the Formly platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0F4C8F] px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="inline-block mb-8">
            <FormlyLogo size="sm" variant="white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          <p className="mt-2 text-blue-200 text-sm">Last updated: June 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12 prose prose-gray prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 max-w-none">

        <p className="text-gray-600 text-base leading-relaxed">
          These Terms of Service ("Terms") constitute a legally binding agreement between you (or the
          company you represent) ("Customer") and Formly, Inc. ("Formly," "we," or "us") governing your
          access to and use of the Formly platform and website (collectively, the "Service").
        </p>
        <p className="text-gray-600 text-base leading-relaxed">
          By creating an account or using the Service you agree to these Terms. If you are accepting on
          behalf of a company, you represent that you have authority to bind that company.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">1. The Service</h2>
        <p className="text-gray-600">
          Formly provides a software-as-a-service platform that connects Meta Instant Forms to
          ServiceTitan, enabling automated lead routing, Conversions API (CAPI) event firing, and branded
          email follow-up. The specific features available to you depend on your subscription plan.
        </p>
        <p className="text-gray-600">
          We reserve the right to modify, suspend, or discontinue any part of the Service at any time
          with reasonable notice. We will not be liable for modifications, suspension, or discontinuation
          of any free or trial features without notice.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">2. Account Registration</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li>You must provide accurate, complete information when registering.</li>
          <li>You are responsible for maintaining the confidentiality of your credentials.</li>
          <li>You are responsible for all activity that occurs under your account.</li>
          <li>You must promptly notify us of any unauthorized use at{" "}
            <a href="mailto:support@formly.app" className="text-[#0F4C8F] hover:underline">support@formly.app</a>.
          </li>
          <li>Accounts may not be transferred without written consent from Formly.</li>
          <li>You must be at least 18 years old to use the Service.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">3. Subscription and Payment</h2>
        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">3.1 Plans and Billing</h3>
        <p className="text-gray-600">
          Formly offers subscription plans billed monthly or annually. By subscribing you authorize us to
          charge your payment method on a recurring basis. All fees are in USD and are non-refundable
          except as expressly stated in these Terms.
        </p>
        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">3.2 Free Trial</h3>
        <p className="text-gray-600">
          We may offer a free trial period. At the end of the trial, your account will automatically
          convert to a paid subscription unless you cancel before the trial ends.
        </p>
        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">3.3 Cancellation</h3>
        <p className="text-gray-600">
          You may cancel your subscription at any time from your account settings. Cancellation takes
          effect at the end of the current billing period; you will retain access through that date.
        </p>
        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">3.4 Price Changes</h3>
        <p className="text-gray-600">
          We will give you at least 30 days' notice of price changes. Continued use after the effective
          date constitutes acceptance of the new pricing.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">4. Acceptable Use</h2>
        <p className="text-gray-600">You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li>Use the Service to process leads obtained without the knowledge or consent of the individuals.</li>
          <li>Violate Meta's Platform Terms, ServiceTitan's terms of service, or any applicable law.</li>
          <li>Send spam, unsolicited communications, or deceptive messages via the email feature.</li>
          <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
          <li>Reverse-engineer, decompile, or disassemble the Service.</li>
          <li>Use the Service to transmit malware, viruses, or harmful code.</li>
          <li>Resell or sublicense access to the Service without express written permission.</li>
          <li>Use automated means to scrape data from the Service beyond normal API usage.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">5. Your Data and Content</h2>
        <p className="text-gray-600">
          You retain ownership of all data you input into the Service, including lead data, brand assets,
          and campaign configurations ("Customer Data"). You grant Formly a limited license to process
          Customer Data solely to provide the Service.
        </p>
        <p className="text-gray-600">
          You represent and warrant that: (a) you have all necessary rights to the Customer Data;
          (b) processing of Customer Data through the Service complies with all applicable laws including
          data protection laws; and (c) you have provided all required notices and obtained all required
          consents from individuals whose data you process.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">6. Third-Party Integrations</h2>
        <p className="text-gray-600">
          The Service integrates with Meta (Facebook) and ServiceTitan. Your use of these integrations is
          subject to their respective terms of service and platform policies. Formly is not responsible
          for the availability, accuracy, or conduct of third-party platforms. You are solely responsible
          for maintaining compliance with Meta's Platform Terms, including data use policies governing
          lead data and the Conversions API.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">7. Intellectual Property</h2>
        <p className="text-gray-600">
          The Service, including all software, designs, text, and graphics, is owned by Formly and
          protected by copyright, trademark, and other intellectual property laws. These Terms do not
          grant you any rights to use Formly's trademarks, logos, or brand elements.
        </p>
        <p className="text-gray-600">
          You grant Formly the right to use your company name and logo for the sole purpose of identifying
          you as a customer on our website, unless you opt out by notifying us in writing.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">8. Confidentiality</h2>
        <p className="text-gray-600">
          Each party agrees to keep the other's non-public business and technical information confidential
          and not to disclose it to third parties without prior written consent, except as required by law.
          This obligation survives termination of these Terms for 3 years.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">9. Warranties and Disclaimers</h2>
        <p className="text-gray-600">
          Formly warrants that the Service will perform materially as described in our documentation
          during your subscription term. YOUR SOLE REMEDY FOR BREACH OF THIS WARRANTY IS A PRO-RATED
          REFUND OF FEES PAID FOR THE AFFECTED PERIOD.
        </p>
        <p className="text-gray-600">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE
          WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">10. Limitation of Liability</h2>
        <p className="text-gray-600">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, FORMLY'S TOTAL CUMULATIVE LIABILITY FOR ALL CLAIMS
          ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A)
          THE FEES PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) $100.
        </p>
        <p className="text-gray-600">
          IN NO EVENT SHALL FORMLY BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, EVEN IF ADVISED
          OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">11. Indemnification</h2>
        <p className="text-gray-600">
          You agree to indemnify and hold harmless Formly and its officers, directors, employees, and
          agents from any claims, damages, losses, and costs (including reasonable legal fees) arising
          from: (a) your use of the Service in violation of these Terms; (b) your Customer Data; or
          (c) your violation of any law or third-party rights.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">12. Term and Termination</h2>
        <p className="text-gray-600">
          These Terms are effective from the date you first access the Service and continue until
          terminated. Either party may terminate for convenience with 30 days' written notice. We may
          terminate immediately if you breach these Terms and fail to cure the breach within 10 days
          of notice.
        </p>
        <p className="text-gray-600">
          Upon termination: (a) your access to the Service ceases; (b) we will retain Customer Data for
          90 days during which you may export it; (c) after 90 days we will delete Customer Data from
          live systems per our data retention policy.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">13. Dispute Resolution</h2>
        <p className="text-gray-600">
          These Terms are governed by the laws of the State of Delaware, without regard to conflict of
          law principles. For disputes under $10,000 we encourage you to contact us first at{" "}
          <a href="mailto:support@formly.app" className="text-[#0F4C8F] hover:underline">support@formly.app</a>;
          we will work in good faith to resolve the issue. For larger disputes, both parties agree to
          binding arbitration administered by JAMS under its Streamlined Arbitration Rules.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">14. General</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li><strong>Entire agreement:</strong> These Terms and our Privacy Policy constitute the entire agreement between you and Formly regarding the Service.</li>
          <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in full force.</li>
          <li><strong>Waiver:</strong> Failure to enforce any provision is not a waiver of future rights.</li>
          <li><strong>Assignment:</strong> You may not assign these Terms without our written consent. We may assign them in connection with a merger or acquisition.</li>
          <li><strong>Notices:</strong> Legal notices to Formly must be sent to the email below. We may send notices to the email on your account.</li>
          <li><strong>Force majeure:</strong> Neither party is liable for delays caused by circumstances beyond their reasonable control.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">15. Contact</h2>
        <div className="bg-gray-50 rounded-lg p-5 text-gray-600 text-sm space-y-1">
          <p><strong>Formly, Inc.</strong></p>
          <p>
            Email:{" "}
            <a href="mailto:legal@formly.app" className="text-[#0F4C8F] hover:underline">
              legal@formly.app
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
