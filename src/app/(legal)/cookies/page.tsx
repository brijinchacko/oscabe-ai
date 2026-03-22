import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiePolicyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cookie Policy</h1>
      <p className="text-sm text-gray-500">Last updated: March 2026</p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">What Are Cookies?</h2>
      <p>
        Cookies are small text files that are placed on your device when you visit a website. They
        are widely used to make websites work more efficiently and to provide information to the
        owners of the site. Cookies allow us to recognise your device and store information about
        your preferences or past actions.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">How We Use Cookies</h2>
      <p>
        Oscabe Ltd (&quot;we&quot;, &quot;us&quot;) uses cookies and similar technologies on{" "}
        <strong>oscabe.com</strong> to improve your browsing experience, analyse site traffic, and
        understand where our visitors come from. We categorise our cookies into three types:
      </p>

      <h3 className="mt-8 text-lg font-semibold text-gray-900">Essential Cookies</h3>
      <p>
        These cookies are strictly necessary for the website to function. They enable core features
        such as security, account authentication, and session management. You cannot opt out of
        essential cookies as the website cannot function properly without them.
      </p>

      <h3 className="mt-8 text-lg font-semibold text-gray-900">Analytics Cookies</h3>
      <p>
        These cookies help us understand how visitors interact with our website by collecting and
        reporting information anonymously. This helps us improve the structure and content of our
        site.
      </p>

      <h3 className="mt-8 text-lg font-semibold text-gray-900">Preference Cookies</h3>
      <p>
        These cookies allow the website to remember choices you make (such as your preferred language
        or region) and provide enhanced, more personalised features.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Cookies We Use</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Cookie Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Purpose</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-4 py-3 font-mono text-xs">__clerk_db_jwt</td>
              <td className="px-4 py-3">Essential</td>
              <td className="px-4 py-3">Clerk authentication session token</td>
              <td className="px-4 py-3">Session</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">__session</td>
              <td className="px-4 py-3">Essential</td>
              <td className="px-4 py-3">User session management</td>
              <td className="px-4 py-3">Session</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">__client_uat</td>
              <td className="px-4 py-3">Essential</td>
              <td className="px-4 py-3">Clerk client authentication state</td>
              <td className="px-4 py-3">1 year</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">cookie_consent</td>
              <td className="px-4 py-3">Essential</td>
              <td className="px-4 py-3">Stores your cookie consent preferences</td>
              <td className="px-4 py-3">1 year</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">_ga</td>
              <td className="px-4 py-3">Analytics</td>
              <td className="px-4 py-3">Google Analytics, distinguishes unique users</td>
              <td className="px-4 py-3">2 years</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">_ga_*</td>
              <td className="px-4 py-3">Analytics</td>
              <td className="px-4 py-3">Google Analytics, maintains session state</td>
              <td className="px-4 py-3">2 years</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">_gid</td>
              <td className="px-4 py-3">Analytics</td>
              <td className="px-4 py-3">Google Analytics, distinguishes users</td>
              <td className="px-4 py-3">24 hours</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">theme</td>
              <td className="px-4 py-3">Preference</td>
              <td className="px-4 py-3">Stores your preferred colour theme</td>
              <td className="px-4 py-3">1 year</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">locale</td>
              <td className="px-4 py-3">Preference</td>
              <td className="px-4 py-3">Stores your preferred language/region</td>
              <td className="px-4 py-3">1 year</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Third-Party Cookies</h2>
      <p>
        Some cookies are placed by third-party services that appear on our pages. We do not control
        the use of these cookies. The third-party providers include:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Google Analytics:</strong> for website traffic analysis. See{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Google&apos;s Privacy Policy
          </a>
        </li>
        <li>
          <strong>Clerk:</strong> for authentication and user management. See{" "}
          <a
            href="https://clerk.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Clerk&apos;s Privacy Policy
          </a>
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">How to Manage Cookies</h2>
      <p>
        You can control and manage cookies in several ways. Please note that removing or blocking
        cookies may impact your user experience and some features may no longer be available.
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Browser settings:</strong> most browsers allow you to refuse or delete cookies
          through their settings. The location of these settings varies by browser. Check your
          browser&apos;s help menu for guidance.
        </li>
        <li>
          <strong>Our cookie banner:</strong> when you first visit our site, you can choose which
          categories of cookies to accept. You can update your preferences at any time by clicking
          the cookie settings link in our website footer.
        </li>
        <li>
          <strong>Google Analytics opt-out:</strong> you can opt out of Google Analytics by
          installing the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          .
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Changes to This Policy</h2>
      <p>
        We may update this cookie policy from time to time. Any changes will be posted on this page
        with an updated revision date.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Contact Us</h2>
      <p>
        If you have any questions about our use of cookies, please contact us at{" "}
        <a href="mailto:info@oscabe.com" className="text-indigo-600 hover:text-indigo-500">
          info@oscabe.com
        </a>
        .
      </p>
    </article>
  );
}
