import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TEE Attestation Explorer",
    template: "%s | TEE Attestation Explorer",
  },
  description:
    "Secure and comprehensive analysis tool for TEE attestation reports. Verify and gain insights into your trusted computing environments with TEE Attestation Explorer.",
  keywords: [
    "TEE",
    "Trusted Execution Environment",
    "Attestation",
    "Security",
    "Analysis",
    "dstack",
    "TEE Attestation Explorer",
  ],
  authors: [{ name: "PhalaNetwork" }],
  creator: "PhalaNetwork",
  publisher: "PhalaNetwork",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    // url: 'https://www.example.com',
    siteName: "TEE Attestation Explorer",
    title: "TEE Attestation Explorer",
    description:
      "Secure and comprehensive analysis tool for TEE attestation reports. Verify and gain insights into your trusted computing environments.",
    // images: [
    //   {
    //     url: 'https://www.example.com/og-image.jpg',
    //     width: 1200,
    //     height: 630,
    //     alt: 'dstack Confidant logo',
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TEE Attestation Explorer",
    description:
      "Secure and comprehensive analysis for TEE attestation reports.",
    // images: ['https://www.example.com/twitter-image.jpg'],
    creator: "@PhalaNetwork",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
