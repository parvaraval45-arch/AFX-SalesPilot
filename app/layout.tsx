import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AFX SalesPilot | NetApp",
  description:
    "AI-powered pre-sales intelligence for NetApp field teams — product selection, AFX sizing, competitive battlecards, and proposal generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="font-sans antialiased bg-netapp-surface overflow-x-hidden">
        <Sidebar />
        {/* Desktop layout */}
        <div className="hidden md:flex min-h-screen flex-col" style={{ marginLeft: 240 }}>
          <TopBar />
          <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
        </div>
        {/* Mobile layout */}
        <div className="md:hidden min-h-screen flex flex-col pb-16">
          <TopBar />
          <main className="flex-1 p-4 overflow-x-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}
