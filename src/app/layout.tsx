import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ForceLight from "@/components/ForceLight";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ระบบประมวลผลคะแนนนักเรียน",
  description: "ระบบประมวลผลคะแนนนักเรียนจากไฟล์ Excel อัตโนมัติ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="light">
      <body className={`${inter.className} bg-white text-black min-h-screen`}>
        <ForceLight />
        {children}
      </body>
    </html>
  );
}