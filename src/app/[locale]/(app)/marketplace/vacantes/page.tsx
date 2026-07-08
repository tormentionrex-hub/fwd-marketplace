import VacantesExplorer from "@/components/features/marketplace/VacantesExplorer";
import Footer from "@/components/Footer";
import HomeButton from "@/components/HomeButton";
import SettingsPanel from "@/components/SettingsPanel";
import { listarVacantesParaMarketplace } from "@/server/services/vacante.service";

// Cachea la página 60 s y revalida en background.
export const revalidate = 60;

export default async function VacantesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const vacantes = await listarVacantesParaMarketplace();

  return (
    <div className="flex flex-col">
      <HomeButton />
      <div className="fixed right-40 top-5 z-50">
        <SettingsPanel />
      </div>
      <VacantesExplorer vacantes={vacantes} locale={locale} />
      <Footer />
    </div>
  );
}
