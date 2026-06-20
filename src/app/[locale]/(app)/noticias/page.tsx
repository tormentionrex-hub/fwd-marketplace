import MarketingDashboard from "@/components/features/marketplace/MarketingDashboard";
import HomeButton from "@/components/HomeButton";
import Footer from "@/components/Footer";
import NoticiasHero from "@/components/features/noticias/NoticiasHero";

export const revalidate = 3600;

export default function NoticiasPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HomeButton />
      <NoticiasHero />
      <MarketingDashboard />
      <Footer />
    </div>
  );
}
