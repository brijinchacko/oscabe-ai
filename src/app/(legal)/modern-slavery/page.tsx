import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modern Slavery Statement",
};

export default function ModernSlaveryPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Modern Slavery Act Statement
      </h1>
      <p className="text-sm text-gray-500">Last updated: March 2026</p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Our Commitment</h2>
      <p>
        Oscabe Ltd (Company No. 15913493) is committed to preventing slavery and human trafficking
        in all its forms within our business and supply chain. We are part of the Wartens Ltd group
        and share its values of ethical business conduct, transparency, and respect for human rights.
      </p>
      <p>
        This statement is made pursuant to Section 54 of the Modern Slavery Act 2015 and sets out
        the steps we have taken, and continue to take, to ensure that modern slavery and human
        trafficking are not taking place within our business or supply chain.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Our Business</h2>
      <p>
        Oscabe Ltd operates an AI-powered recruitment platform specialising in the industrial
        automation sector, including PLC, SCADA, Controls, Robotics, EC&amp;I, Commissioning, and
        Maintenance. We connect candidates with employers across the United Kingdom and
        internationally.
      </p>
      <p>
        Our registered address is Unit 8, Lyon Road, Milton Keynes, MK1 1EX. As a recruitment
        services provider, we recognise that we have a particular responsibility to be alert to the
        risks of modern slavery and human trafficking, both in our own business and in the wider
        labour supply chain.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Our Policies</h2>
      <p>We operate the following policies that are relevant to our commitment:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Anti-Slavery and Human Trafficking Policy:</strong> we have a clear policy that
          sets out our zero-tolerance approach to modern slavery
        </li>
        <li>
          <strong>Recruitment Policy:</strong> we conduct robust checks on all candidates and ensure
          that all workers have the right to work in the relevant jurisdiction
        </li>
        <li>
          <strong>Whistleblowing Policy:</strong> we encourage all employees, workers, and
          third-party partners to report any concerns about modern slavery without fear of reprisal
        </li>
        <li>
          <strong>Code of Conduct:</strong> our code of conduct makes clear the actions and behaviour
          expected of all employees and partners
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Due Diligence</h2>
      <p>
        As part of our efforts to monitor and reduce the risk of modern slavery occurring within our
        business and supply chain, we have implemented the following due diligence procedures:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Conducting risk assessments to identify areas of our business and supply chain where there
          is a risk of modern slavery
        </li>
        <li>
          Vetting all new suppliers and conducting ongoing monitoring of existing suppliers
        </li>
        <li>
          Verifying the identity and right-to-work status of all candidates placed through our
          services
        </li>
        <li>
          Requiring all clients and suppliers to confirm their compliance with the Modern Slavery Act
          2015
        </li>
        <li>
          Maintaining clear records of all due diligence activities undertaken
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Supply Chain</h2>
      <p>
        Our supply chain primarily consists of technology providers, cloud services, and professional
        service firms. We assess the risk of modern slavery in our supply chain by:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Evaluating new and existing suppliers against modern slavery and human trafficking criteria
        </li>
        <li>
          Including anti-slavery clauses in our contracts with suppliers
        </li>
        <li>
          Engaging with suppliers to understand their own policies and due diligence processes
        </li>
        <li>
          Taking appropriate action where concerns are identified, up to and including termination of
          the business relationship
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Training</h2>
      <p>
        We provide training to all employees to ensure a high level of understanding of the risks of
        modern slavery and human trafficking in our business and supply chains. This includes:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Awareness training for all staff on the indicators of modern slavery and how to report
          concerns
        </li>
        <li>
          Specialist training for recruitment consultants on verifying candidate identity,
          right-to-work documentation, and spotting signs of exploitation
        </li>
        <li>
          Regular updates and refresher training to ensure continued awareness
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Reporting Concerns</h2>
      <p>
        We encourage anyone who has concerns about modern slavery within our business or supply chain
        to report them. Reports can be made:
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          By email to{" "}
          <a href="mailto:info@oscabe.com" className="text-indigo-600 hover:text-indigo-500">
            info@oscabe.com
          </a>
        </li>
        <li>In writing to: Oscabe Ltd, Unit 8, Lyon Road, Milton Keynes, MK1 1EX</li>
        <li>Through our internal whistleblowing procedures</li>
      </ul>
      <p>
        All reports will be treated confidentially and investigated thoroughly. We will not tolerate
        any retaliation against individuals who raise genuine concerns in good faith.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Review</h2>
      <p>
        This statement is reviewed and updated annually. The board of directors of Oscabe Ltd has
        overall responsibility for ensuring this policy and its implementation comply with our legal
        and ethical obligations.
      </p>
      <p>
        Oscabe Ltd, Unit 8, Lyon Road, Milton Keynes, MK1 1EX
        <br />
        Company No. 15913493 (England &amp; Wales)
      </p>
    </article>
  );
}
