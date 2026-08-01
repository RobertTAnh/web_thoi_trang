import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "LUNARA";

export const metadata: Metadata = {
  title: {
    default: `${brand} — Thời trang nữ`,
    template: `%s | ${brand}`,
  },
  description: "Cửa hàng thời trang nữ hiện đại — đầm, vest, sơ mi và hơn thế nữa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${dmSans.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
