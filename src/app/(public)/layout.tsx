import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { SiteModeProvider } from "@/components/providers/site-mode-provider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteModeProvider>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CookieBanner />
    </SiteModeProvider>
  );
}
