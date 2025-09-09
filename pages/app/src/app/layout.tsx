import type { Metadata } from "next";
import "./globals.css";
import { DynamicProviderWrapper } from '@/components/DynamicProviderWrapper';
import { VaultsProvider } from '@/providers/VaultsProvider';
// Import async storage mock to fix Dynamic Labs compatibility
import '@/lib/mock-async-storage';

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
        <DynamicProviderWrapper>
          <VaultsProvider>
            {children}
          </VaultsProvider>
        </DynamicProviderWrapper>
      </body>
    </html>
  );
}