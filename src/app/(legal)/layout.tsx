import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SiteModeProvider } from "@/components/providers/site-mode-provider";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteModeProvider>
      <Navbar />
      <main className="min-h-screen bg-[#02012B] py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8
          [&_article]:text-gray-300
          [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white
          [&_a]:text-[#00D4FF] [&_a:hover]:text-[#4540DB]
          [&_strong]:text-white
          [&_li]:text-gray-300
          [&_p]:text-gray-400
          [&_.text-gray-900]:text-white
          [&_.text-gray-500]:text-gray-500
          [&_.prose]:prose-invert
        ">
          {children}
        </div>
      </main>
      <Footer />
    </SiteModeProvider>
  );
}
