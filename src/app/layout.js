import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "900"],
  variable: "--font-inter",
});

export const metadata = {
  title: "UK AI Policy Validator",
  description:
    "Validate your AI policies against UK regulatory requirements (ICO, DSIT, CDEI) with evidence-backed compliance assessment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
