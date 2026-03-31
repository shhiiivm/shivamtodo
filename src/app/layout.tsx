import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: "#6b21a8",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Shivam's Tool Hub | Notepad, Links, Images",
  description: "A simple, fast dashboard for notes, links, and image URLs. Built with Next.js and Firebase.",
  keywords: ["dsa tracker", "shivam tools", "notepad", "image stash", "nextjs dashboard"],
  robots: "index, follow",
  alternates: {
    canonical: "https://todo-shivam.com",
  },
  openGraph: {
    title: "Shivam's Tool Hub | Notepad, Links, Images",
    description: "A fast, simple dashboard for notes, links, and image URLs.",
    type: "website",
    locale: "en_US",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Navbar />
        <main style={{ marginTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>

        <footer style={{
          padding: '2rem',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--glass-border)',
          opacity: 0.6,
          fontSize: '0.8rem'
        }}>
          &copy; 2024 TODO Shivam - Personal DSA Dashboard &amp; Media Hub
        </footer>
      </body>
    </html>
  );
}
