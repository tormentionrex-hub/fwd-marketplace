import type { Metadata } from "next";
import SolicitudesView from "@/components/features/solicitudes/SolicitudesView";

export const metadata: Metadata = {
  title: "Solicitudes de mensaje · FWD Marketplace",
};

export default function SolicitudesPage() {
  return <SolicitudesView />;
}
