import { TopBar } from "@/components/store/TopBar";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { FloatingContact } from "@/components/store/FloatingContact";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContact />
    </>
  );
}
