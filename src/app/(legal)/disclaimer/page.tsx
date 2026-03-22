import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Website Disclaimer</h1>
      <p className="text-sm text-gray-500">Last updated: March 2026</p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">General Disclaimer</h2>
      <p>
        The information provided on <strong>oscabe.com</strong> (the &quot;Website&quot;) by Oscabe
        Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is for general informational purposes
        only. All information on the Website is provided in good faith; however, we make no
        representation or warranty of any kind, express or implied, regarding the accuracy, adequacy,
        validity, reliability, availability, or completeness of any information on the Website.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Job Listings</h2>
      <p>
        We make no guarantees regarding the accuracy, availability, or suitability of job listings
        displayed on the Website. Job listings are provided by third-party employers and clients, and
        while we take reasonable steps to ensure they are genuine and current, we cannot guarantee:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>That any listed position is still available at the time of viewing</li>
        <li>That the details of a role (including responsibilities, requirements, and benefits) are accurate or complete</li>
        <li>That any application will result in an interview or job offer</li>
        <li>The suitability of any role for any particular candidate</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Salary Information</h2>
      <p>
        Any salary ranges, pay rates, or compensation figures displayed on the Website are
        indicative only and should not be relied upon as a guarantee of earnings. Actual compensation
        may vary based on factors including but not limited to experience, qualifications, location,
        market conditions, and employer discretion. We do not guarantee that any salary figure shown
        reflects the final offer that may be made by an employer.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">AI-Powered Matching</h2>
      <p>
        Our platform uses artificial intelligence and machine learning to match candidates with job
        opportunities. While our AI tools are designed to improve the quality and relevance of
        matches, they are not infallible. AI-generated recommendations, scores, and assessments
        should be considered as one factor among many in any recruitment decision. We do not
        guarantee the accuracy or suitability of any AI-generated output.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Professional Advice Disclaimer</h2>
      <p>
        The content on this Website does not constitute professional advice of any kind, including
        but not limited to:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>Legal advice</li>
        <li>Financial or tax advice</li>
        <li>Career counselling or guidance</li>
        <li>Employment law advice</li>
        <li>Immigration or visa advice</li>
      </ul>
      <p>
        You should always seek independent professional advice before making any decisions based on
        information found on the Website. Oscabe Ltd accepts no liability for any decisions made or
        actions taken in reliance on the information provided on this Website.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">External Links</h2>
      <p>
        The Website may contain links to external websites that are not provided or maintained by, or
        in any way affiliated with, Oscabe Ltd. We do not guarantee the accuracy, relevance,
        timeliness, or completeness of any information on these external websites. The inclusion of
        any links does not necessarily imply a recommendation or endorsement of the views expressed
        within them.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Limitation of Liability</h2>
      <p>
        Under no circumstance shall Oscabe Ltd be liable for any loss or damage of any kind incurred
        as a result of the use of the Website or reliance on any information provided on the Website.
        Your use of the Website and your reliance on any information on the Website is solely at your
        own risk.
      </p>
      <p>
        Nothing in this disclaimer excludes or limits liability for death or personal injury caused
        by negligence, fraud, or any other liability which cannot be excluded or limited under
        applicable law.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Contact Us</h2>
      <p>
        If you have any questions about this disclaimer, please contact us at{" "}
        <a href="mailto:info@oscabe.com" className="text-indigo-600 hover:text-indigo-500">
          info@oscabe.com
        </a>
        .
      </p>
      <p>
        Oscabe Ltd, Unit 8, Lyon Road, Milton Keynes, MK1 1EX
        <br />
        Company No. 15913493 (England &amp; Wales)
      </p>
    </article>
  );
}
