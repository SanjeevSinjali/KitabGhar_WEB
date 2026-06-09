import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";

export default function HomepageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}