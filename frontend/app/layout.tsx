import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keeping fonts as they are good
import "./globals.css";
import AntdRegistry from "@/components/AntdRegistry";
import MainLayout from "@/components/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Air Cargo Booking",
  description: "Book and Track your Air Cargo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0 }}
      >
        <AntdRegistry>
          <MainLayout>
            {children}
          </MainLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
