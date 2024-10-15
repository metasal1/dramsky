import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "./components/WalletProvider/AppWalletProvider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dramsky Breakpoint 2024 - NFT Minting",
  description: "Dramsky is proud to present the Dramsky Breakpoint 2024 Whisky - NFT Minting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <AppWalletProvider>
      <body className={inter.className}>{children}</body>
       </AppWalletProvider>
    </html>
  );
}
