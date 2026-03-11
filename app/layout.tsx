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
    "Enterprise B2B sales tool for NetApp field sales — product selection, AFX sizing, competitive intelligence, and proposal generation.",
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
        <div className="ml-[240px] min-h-screen flex flex-col">
          <TopBar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
