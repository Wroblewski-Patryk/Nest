import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { resolveLanguage } from "@nest/shared-types";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Nest | Digital Sanctuary",
  description: "Calm-first life orchestration workspace for daily planning and reflection.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const language = resolveLanguage(
    cookieStore.get("nest.ui.language")?.value ?? process.env.NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE ?? "en"
  );

  return (
    <html lang={language}>
      <body className={`${inter.variable} ${cormorantGaramond.variable} app-root`}>{children}</body>
    </html>
  );
}
