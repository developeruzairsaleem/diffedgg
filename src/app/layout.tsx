"use client";
import type { Metadata } from "next";
import { Lato, Orbitron, Poppins } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import SmoothScrollScript from "@/components/SmoothScrollScript";
import dynamic from "next/dynamic";

const NotificationContainer = dynamic(
  () => import("@/components/notifications/NotificationContainer"),
  { ssr: false }
);

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

// export const metadata: Metadata = {
//   title: "Diffed.gg",
//   description: "Gaming",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} ${orbitron.variable} ${poppins.variable} antialiased`}
      >
        {/* <SmoothScrollScript /> */}
        <NotificationContainer />
        <main>{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
