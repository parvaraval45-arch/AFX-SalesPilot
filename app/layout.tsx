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
      <body className="font-sans antialiased bg-netapp-surface">
        <Sidebar />
        {/* Desktop layout */}
        <div className="hidden md:flex md:ml-[240px] min-h-screen flex-col">
          <TopBar />
          <main className="flex-1 p-6">{children}</main>
        </div>
        {/* Mobile layout */}
        <div className="md:hidden min-h-screen flex flex-col pb-16">
          <TopBar />
          <main className="flex-1 p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
