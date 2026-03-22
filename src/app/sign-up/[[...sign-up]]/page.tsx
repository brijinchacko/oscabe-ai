import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#02012B] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/10 blur-[120px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <SignUp
        appearance={{
          elements: {
            rootBox: "relative z-10",
            card: "shadow-2xl shadow-black/40 border border-white/[0.08] bg-[#0a0a2e]",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-400",
            formButtonPrimary: "bg-[#4540DB] hover:bg-[#4540DB]/80 shadow-lg shadow-[#4540DB]/25",
            formFieldInput: "bg-white/[0.05] border-white/[0.1] text-white",
            formFieldLabel: "text-gray-300",
            footerActionLink: "text-[#00D4FF] hover:text-[#4540DB]",
            dividerLine: "bg-white/[0.1]",
            dividerText: "text-gray-500",
            socialButtonsBlockButton: "border-white/[0.1] bg-white/[0.05] text-white hover:bg-white/[0.1]",
            socialButtonsBlockButtonText: "text-gray-300",
          },
        }}
        forceRedirectUrl="/crm"
      />
    </div>
  );
}
