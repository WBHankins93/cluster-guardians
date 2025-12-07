import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-game",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Cluster Guardians - Learn Kubernetes Through Adventure",
  description:
    "A story-driven Kubernetes educational game combining RPG exploration with hands-on terminal challenges",
  keywords: ["kubernetes", "k8s", "learning", "education", "game", "devops"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-game antialiased bg-gray-900 text-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}
