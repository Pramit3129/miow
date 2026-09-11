import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aven — Lending workspace",
  description: "A clear path from application to possibility. Your connected lending workspace.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
