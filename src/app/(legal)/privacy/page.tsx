import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Privacy Notice</h1>
      <p className="text-sm text-gray-500">Last updated: March 2026</p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">1. Who We Are</h2>
      <p>
        Oscabe Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a company registered in
        England &amp; Wales (Company No. 15913493). Our registered address is Unit 8, Lyon Road,
        Milton Keynes, MK1 1EX. Oscabe Ltd is part of the Wartens Ltd group.
      </p>
      <p>
        We are the data controller for the personal data we process through{" "}
        <strong>oscabe.com</strong> and our related recruitment services. Our ICO registration is
        held via Wartens Ltd.
      </p>
      <p>
        If you have any questions about this privacy notice, please contact us at{" "}
        <a href="mailto:info@oscabe.com" className="text-indigo-600 hover:text-indigo-500">
          info@oscabe.com
        </a>
        .
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">2. What Data We Collect</h2>
      <p>We may collect and process the following categories of personal data:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Identity data:</strong> first name, last name, job title, employer
        </li>
        <li>
          <strong>Contact data:</strong> email address, telephone number, postal address
        </li>
        <li>
          <strong>Account data:</strong> username, password (hashed), account preferences
        </li>
        <li>
          <strong>Professional data:</strong> CV/resume, work history, qualifications, skills,
          salary expectations, right-to-work status
        </li>
        <li>
          <strong>Technical data:</strong> IP address, browser type and version, device information,
          time zone, operating system
        </li>
        <li>
          <strong>Usage data:</strong> pages visited, links clicked, search queries, time spent on
          pages
        </li>
        <li>
          <strong>Marketing data:</strong> communication preferences, newsletter subscriptions
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">3. How We Use Your Data</h2>
      <p>We use your personal data for the following purposes:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>To provide our recruitment and job-matching services</li>
        <li>To create and manage your account on our platform</li>
        <li>To match candidates with suitable job opportunities using our AI-powered tools</li>
        <li>To communicate with you about roles, applications, and our services</li>
        <li>To improve and personalise your experience on our website</li>
        <li>To send marketing communications where you have consented</li>
        <li>To comply with legal and regulatory obligations</li>
        <li>To detect and prevent fraud or other unlawful activity</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">4. Legal Basis for Processing</h2>
      <p>We rely on the following legal bases under UK GDPR:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Consent:</strong> where you have given clear consent for us to process your
          personal data for a specific purpose (e.g., marketing emails)
        </li>
        <li>
          <strong>Contract:</strong> where processing is necessary for the performance of a contract
          with you or to take steps at your request before entering into a contract
        </li>
        <li>
          <strong>Legitimate interests:</strong> where processing is necessary for our legitimate
          interests (e.g., improving our services, fraud prevention) and those interests are not
          overridden by your rights
        </li>
        <li>
          <strong>Legal obligation:</strong> where processing is necessary to comply with a legal
          obligation
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">5. Data Sharing</h2>
      <p>We may share your personal data with the following categories of recipients:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Employers and hiring managers:</strong> when you apply for a role or we identify
          you as a potential match
        </li>
        <li>
          <strong>Group companies:</strong> Wartens Ltd and other entities within our group for
          internal administration
        </li>
        <li>
          <strong>Service providers:</strong> cloud hosting, email delivery, analytics, payment
          processing, and CRM providers who act as our data processors
        </li>
        <li>
          <strong>Professional advisers:</strong> lawyers, auditors, and insurers where necessary
        </li>
        <li>
          <strong>Law enforcement and regulators:</strong> where required by law or to protect our
          legal rights
        </li>
      </ul>
      <p>We do not sell your personal data to third parties.</p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">6. International Transfers</h2>
      <p>
        Your personal data may be transferred to, and processed in, countries outside the United
        Kingdom. Where this occurs, we ensure that appropriate safeguards are in place, such as:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>Transfers to countries with an adequacy decision from the UK Government</li>
        <li>Standard contractual clauses approved by the UK Information Commissioner</li>
        <li>Binding corporate rules where applicable</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">7. Data Retention</h2>
      <p>
        We retain your personal data only for as long as is necessary for the purposes for which it
        was collected. Specific retention periods include:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Candidate profiles:</strong> retained for up to 3 years from your last interaction
          with us, unless you request earlier deletion
        </li>
        <li>
          <strong>Client data:</strong> retained for the duration of our business relationship plus 6
          years for legal and accounting purposes
        </li>
        <li>
          <strong>Website analytics:</strong> aggregated and anonymised data retained indefinitely;
          identifiable data retained for up to 26 months
        </li>
        <li>
          <strong>Marketing preferences:</strong> retained until you withdraw consent
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">8. Your Rights</h2>
      <p>Under UK GDPR, you have the following rights:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Right of access:</strong> to obtain a copy of the personal data we hold about you
        </li>
        <li>
          <strong>Right to rectification:</strong> to have inaccurate data corrected
        </li>
        <li>
          <strong>Right to erasure:</strong> to request deletion of your data in certain
          circumstances
        </li>
        <li>
          <strong>Right to restrict processing:</strong> to limit how we use your data
        </li>
        <li>
          <strong>Right to data portability:</strong> to receive your data in a structured, commonly
          used format
        </li>
        <li>
          <strong>Right to object:</strong> to object to processing based on legitimate interests or
          direct marketing
        </li>
        <li>
          <strong>Rights related to automated decision-making:</strong> to not be subject to
          decisions based solely on automated processing that produce legal or similarly significant
          effects
        </li>
      </ul>
      <p>
        To exercise any of these rights, please visit our{" "}
        <a href="/gdpr" className="text-indigo-600 hover:text-indigo-500">
          GDPR Rights page
        </a>{" "}
        or email us at{" "}
        <a href="mailto:info@oscabe.com" className="text-indigo-600 hover:text-indigo-500">
          info@oscabe.com
        </a>
        . We will respond within one month of receiving your request.
      </p>
      <p>
        You also have the right to lodge a complaint with the Information Commissioner&apos;s Office
        (ICO) at{" "}
        <a
          href="https://ico.org.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-500"
        >
          ico.org.uk
        </a>
        .
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">9. Cookies</h2>
      <p>
        Our website uses cookies to enhance your experience. For full details on the cookies we use
        and how to manage them, please see our{" "}
        <a href="/cookies" className="text-indigo-600 hover:text-indigo-500">
          Cookie Policy
        </a>
        .
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">10. Changes to This Policy</h2>
      <p>
        We may update this privacy notice from time to time. Any changes will be posted on this page
        with an updated revision date. Where changes are significant, we will notify you by email or
        through a notice on our website.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">11. Contact Us</h2>
      <p>
        If you have any questions about this privacy notice or our data practices, please contact us:
      </p>
      <ul className="list-none space-y-1 pl-0">
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:info@oscabe.com" className="text-indigo-600 hover:text-indigo-500">
            info@oscabe.com
          </a>
        </li>
        <li>
          <strong>Post:</strong> Oscabe Ltd, Unit 8, Lyon Road, Milton Keynes, MK1 1EX
        </li>
        <li>
          <strong>Company No.:</strong> 15913493 (England &amp; Wales)
        </li>
      </ul>
    </article>
  );
}
