import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // Old WordPress routes → new Next.js equivalents
      { source: "/about/", destination: "/about", permanent: true },
      { source: "/contact/", destination: "/contact", permanent: true },
      { source: "/candidates/", destination: "/candidates", permanent: true },
      { source: "/international-recruitment/", destination: "/about", permanent: true },
      { source: "/international-recruitment", destination: "/about", permanent: true },
      { source: "/clients/", destination: "/employers", permanent: true },
      { source: "/clients", destination: "/employers", permanent: true },
      { source: "/industrial-automation-recruiter/", destination: "/employers", permanent: true },
      { source: "/industrial-automation-recruiter", destination: "/employers", permanent: true },
      { source: "/contact-2/", destination: "/contact", permanent: true },
      { source: "/contact-2", destination: "/contact", permanent: true },
      // Old WordPress legal pages
      { source: "/privacy/", destination: "/privacy", permanent: true },
      { source: "/cookie/", destination: "/cookies", permanent: true },
      { source: "/cookie", destination: "/cookies", permanent: true },
      { source: "/terms-of-use/", destination: "/terms", permanent: true },
      { source: "/terms-of-use", destination: "/terms", permanent: true },
      { source: "/website-disclaimer/", destination: "/disclaimer", permanent: true },
      { source: "/website-disclaimer", destination: "/disclaimer", permanent: true },
      { source: "/modern-slavery-act/", destination: "/modern-slavery", permanent: true },
      { source: "/modern-slavery-act", destination: "/modern-slavery", permanent: true },
      // Old jobs portal
      { source: "/jobs/Careers", destination: "/jobs", permanent: true },
      // Old WordPress job listing pages (404 in Google Search Console)
      { source: "/recruiter-project-engineer", destination: "/jobs", permanent: true },
      { source: "/recruiter-project-engineer/", destination: "/jobs", permanent: true },
      { source: "/recruiter-plc-programmer", destination: "/jobs", permanent: true },
      { source: "/recruiter-plc-programmer/", destination: "/jobs", permanent: true },
      { source: "/recruiter-automation-engineer", destination: "/jobs", permanent: true },
      { source: "/recruiter-automation-engineer/", destination: "/jobs", permanent: true },
      { source: "/wpr_job_listing/:path", destination: "/jobs", permanent: true },
      { source: "/wpr_job_listing/:path/", destination: "/jobs", permanent: true },
      { source: "/upskill", destination: "/candidates", permanent: true },
      { source: "/upskill/", destination: "/candidates", permanent: true },
      { source: "/terms-of-use/oscabe.com/privacy", destination: "/privacy", permanent: true },
      // Catch-all for any other old recruiter pages
      { source: "/recruiter-:path", destination: "/jobs", permanent: true },
      // Restructured routes
      { source: "/employers", destination: "/uk-recruitment", permanent: true },
      { source: "/employers/", destination: "/uk-recruitment", permanent: true },
      { source: "/industries", destination: "/specialisms", permanent: true },
      { source: "/industries/", destination: "/specialisms", permanent: true },
      // Old WordPress blog posts & author pages
      { source: "/beyond-boundaries-the-global-impact-of-industrial-automation-on-manufacturing-and-beyond", destination: "/about", permanent: true },
      { source: "/beyond-boundaries-the-global-impact-of-industrial-automation-on-manufacturing-and-beyond/", destination: "/about", permanent: true },
      { source: "/sustainability-and-efficiency-the-dual-role-of-industrial-automation-in-a-greener-future", destination: "/about", permanent: true },
      { source: "/sustainability-and-efficiency-the-dual-role-of-industrial-automation-in-a-greener-future/", destination: "/about", permanent: true },
      { source: "/author/:path", destination: "/about", permanent: true },
      { source: "/author/:path/feed", destination: "/about", permanent: true },
      { source: "/author/:path/feed/", destination: "/about", permanent: true },
      // Old WordPress category/blog pages
      { source: "/category/:path", destination: "/about", permanent: true },
      { source: "/category/:path/feed", destination: "/about", permanent: true },
      { source: "/category/:path/feed/", destination: "/about", permanent: true },
      { source: "/navigating-the-future-key-trends-shaping-industrial-automation-in-the-next-decade", destination: "/about", permanent: true },
      { source: "/navigating-the-future-key-trends-shaping-industrial-automation-in-the-next-decade/", destination: "/about", permanent: true },
      // Old WordPress job listing data-verification
      { source: "/wpr_job_listing/data-verification", destination: "/jobs", permanent: true },
      { source: "/wpr_job_listing/data-verification/", destination: "/jobs", permanent: true },
      { source: "/wpr_job_listing/mail-convertor", destination: "/jobs", permanent: true },
      { source: "/wpr_job_listing/mail-convertor/", destination: "/jobs", permanent: true },
    ];
  },
};

export default nextConfig;
