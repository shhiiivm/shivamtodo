import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TODO Shivam | DSA Problem Tracker & Media Gallery",
  description: "A premium, high-performance DSA problem tracker and media gallery for Shivam. Built with Next.js, Firebase, and SEO-optimized.",
  keywords: ["dsa tracker", "shivam todo", "seo calculator", "media manager", "nextjs dashboard"],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  themeColor: "#6b21a8",
  openGraph: {
    title: "TODO Shivam | DSA Problem Tracker & Media Gallery",
    description: "A premium, high-performance DSA problem tracker and media gallery for Shivam. Built with Next.js and Firebase.",
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
      <head>
        <link rel="canonical" href="https://todo-shivam.com" />
      </head>
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
          &copy; 2024 TODO Shivam - Personal DSA Dashboard & Media Hub
        </footer>
      </body>
    </html>
  );
}
