import type { Metadata } from "next";
import { Geist_Mono, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// Geometric display face echoes the round O and crisp X marks.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

// Friendly, highly legible UI text that pairs with Outfit.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tic-Tac-Toe by JKMV",
  authors: [{ name: "Jan Kenneth Villa" }],
  creator: "Jan Kenneth Villa",
  description: "A two-player tic-tac-toe game by Jan Kenneth Villa, built with Next.js, Tailwind CSS and shadcn/ui",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
