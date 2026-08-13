import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Tisora";
const description =
  "Tisora mang đến thời trang nữ thanh lịch, hiện đại với các thiết kế đầm, vest và sơ mi tinh tế cho mọi phong cách.";

export const metadata: Metadata = {
  title: {
    default: `${brand} — Thời trang nữ`,
    template: `%s | ${brand}`,
  },
  description,
  openGraph: {
    title: `${brand} — Thời trang nữ`,
    description,
    siteName: brand,
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnam.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
