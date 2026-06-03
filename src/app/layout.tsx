import type { Metadata } from "next";
import { NavBar } from "@/components/layout/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinTrack",
  description: "Personal finance tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
