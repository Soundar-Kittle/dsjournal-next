import React from "react";

const CookiesPrivacyPolicy = () => {
  return (
    <div className="w-full px-6 sm:px-10 lg:px-14 py-8">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 font-semibold mb-2">
          Dream Science Journals
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
          Cookies &amp; Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Platform:</span> DS Journals (Dream
          Science Journals)
        </p>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium">Last Updated:</span> 27 November 2025
        </p>
      </header>

      {/* 1. Platform Nature */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          1. Platform Nature
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Dream Science Journals (DS Journals) is an open-access academic
          platform providing free public access to journals, articles, DOI
          information and archives.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Currently, the website does not require user registration or public
          authentication. Only the administrative dashboard is restricted and
          secured.
        </p>
      </section>

      {/* Divider */}
      <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-4" />

      {/* 2. Current Data Collection Practice */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          2. Current Data Collection Practice
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          At present, DS Journals does{" "}
          <span className="font-semibold">NOT</span> collect:
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>Public user accounts or login data</li>
          <li>Payment or financial information</li>
          <li>Sensitive personal data</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          All articles are freely accessible, searchable and downloadable.
        </p>
      </section>

      <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-4" />

      {/* 3. Future Payment Gateway Integration */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          3. Future Payment Gateway Integration
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          DS Journals may introduce optional online payment functionality in the
          future for services such as:
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>Article Processing Charges (APC)</li>
          <li>Publication services</li>
          <li>Journal-related administrative fees</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Payments will be processed through secure third-party providers such
          as PayPal or equivalent PCI-compliant payment platforms.
        </p>

        <div className="mt-4 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 px-4 py-3">
          <p className="text-sm font-semibold text-sky-900 dark:text-sky-200 mb-1">
            Important:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-sky-900/80 dark:text-sky-100">
            <li>
              DS Journals will <span className="font-semibold">NOT</span> store
              or process credit/debit card details directly.
            </li>
            <li>
              All sensitive financial information will be securely handled by
              PayPal or the chosen gateway.
            </li>
            <li>
              Payment providers will operate under their own privacy and
              security policies.
            </li>
          </ul>
        </div>
      </section>

      <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-4" />

      {/* 4. Information Collected During Payment */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          4. Information Collected During Payment
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          When payment is enabled, the following information may be requested:
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>Name</li>
          <li>Email address</li>
          <li>Transaction reference ID</li>
          <li>Payment confirmation status</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          These details will be used solely for:
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>Transaction verification</li>
          <li>Service confirmation</li>
          <li>Accounting and compliance purposes</li>
        </ul>
      </section>

      <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-4" />

      {/* 5. Cookies & Payment Sessions */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          5. Cookies &amp; Payment Sessions
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          When payment gateways are active, cookies or session identifiers may
          be used to:
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>Maintain transaction state</li>
          <li>Prevent fraud</li>
          <li>Ensure secure payment processing</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          These cookies will remain temporary and secure.
        </p>
      </section>

      <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-4" />

      {/* 6. Data Sharing with Payment Providers */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          6. Data Sharing with Payment Providers
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Payment data will be shared only with authorised payment processors
          such as PayPal and will not be distributed to any other third party.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          DS Journals does not sell, rent or trade financial data.
        </p>
      </section>

      <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-4" />

      {/* 7. Security Measures */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          7. Security Measures
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          We ensure all payment integrations will comply with:
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>SSL encryption</li>
          <li>Secure API communication</li>
          <li>Industry-standard best practices</li>
        </ul>
      </section>

      <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-4" />

      {/* 8. Your Consent */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          8. Your Consent
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          By using the website and completing any future transactions, you
          consent to the processing of data as described in this policy.
        </p>
      </section>

      <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-4" />

      {/* 9. Contact Information */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          9. Contact Information
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          For any privacy or payment queries:
        </p>
        <div className="mt-3 space-y-1 text-sm">
          <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <span>📧</span>
            <a
              href="mailto:queries@dsjournals.com"
              className="hover:underline text-sky-700 dark:text-sky-400"
            >
              queries@dsjournals.com
            </a>
          </p>
          <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <span>🌐</span>
            <a
              href="https://dsjournals.com/contact-us"
              target="_blank"
              rel="noreferrer"
              className="hover:underline text-sky-700 dark:text-sky-400 break-all"
            >
              https://dsjournals.com/contact-us
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default CookiesPrivacyPolicy;
