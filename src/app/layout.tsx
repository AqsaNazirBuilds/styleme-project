import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-heading" });

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "StyleMe — Your Wardrobe, Styled Your Way",
  description:
    "Organize your closet, discover new outfits, and let your personal AI stylist help you decide what to wear.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", manrope.variable, fraunces.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <main className="flex-1 flex flex-col min-h-full">{children}</main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}