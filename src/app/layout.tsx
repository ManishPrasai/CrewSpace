import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Suspense } from "react";
import { NoticeToast } from "@/components/app/NoticeToast";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Marketing-only accent (handoff/02-visual-design-spec.md): at most one
// italic phrase per landing-page headline, never used in the app.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  title: "Crewspace",
  description: "Invite your team, post announcements, and manage members in one shared workspace.",
  // icon.tsx / apple-icon.tsx (Next's own file conventions) generate the
  // PNG fallbacks and their <link> tags automatically. This adds the SVG
  // variant browsers prefer when they support it.
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <Toaster>
          <Suspense fallback={null}>
            <NoticeToast />
          </Suspense>
          {children}
        </Toaster>
      </body>
    </html>
  );
}
