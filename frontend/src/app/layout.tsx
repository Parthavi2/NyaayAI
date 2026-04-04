import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NyaayAI – AI Powered Legal Aid Platform",
  description:
    "Upload legal notices, FIRs, and summons. Get instant AI-powered analysis, fraud detection, simplified explanations, and reply drafts.",
  keywords: ["legal AI", "legal notice", "FIR analysis", "fake notice detector", "India legal aid"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
