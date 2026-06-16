import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JUSCONECT ADV",
  description: "SaaS jurídico multi-tenant para advogados e clientes.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}