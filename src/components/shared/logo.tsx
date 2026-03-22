import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  linkTo?: string;
}

export function Logo({ variant = "dark", size = "md", linkTo = "/" }: LogoProps) {
  const src = variant === "dark" ? "/logo-indigo.png" : "/logo-white.png";
  const heights = { sm: 24, md: 32, lg: 44 };
  const widths = { sm: 120, md: 160, lg: 220 };

  const img = (
    <Image
      src={src}
      alt="OSCABE"
      width={widths[size]}
      height={heights[size]}
      priority
      className="object-contain"
    />
  );

  if (linkTo) {
    return <Link href={linkTo}>{img}</Link>;
  }
  return img;
}
