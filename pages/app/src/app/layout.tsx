import type { Metadata } from "next";
import "./globals.css";
import { PrivyProviderWrapper } from '@/components/PrivyProviderWrapper';

export const metadata: Metadata = {
  title: "Saven - Financial Savings App",
  description: "Save in crypto, win prizes. Professional financial services with gamification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PrivyProviderWrapper>
          {children}
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
