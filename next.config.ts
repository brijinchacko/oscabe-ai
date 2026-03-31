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
    ];
  },
};

export default nextConfig;
