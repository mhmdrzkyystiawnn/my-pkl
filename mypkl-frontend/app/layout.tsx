import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyPKL Notes - Personal PKL Tracker",
  description: "Personal dashboard untuk mencatat logbook, mengelola dokumen, dan memantau progres PKL",
};

// Theme Colors
const colors = {
  primary: '#222831',      // Primary Dark (background)
  secondary: '#393E46',   // Secondary Dark (cards, borders)
  accent: '#948979',      // Accent (muted brown)
  light: '#DFD0B8',       // Light (text, highlights)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-screen flex"
        style={{ backgroundColor: colors.primary, color: colors.light }}
      >
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
