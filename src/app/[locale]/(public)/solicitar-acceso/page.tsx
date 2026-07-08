import type { Metadata } from "next";
import { SolicitarAccesoCliente } from "./SolicitarAccesoCliente";

export const metadata: Metadata = {
  title: "Solicitar acceso · FWD Costa Rica",
};

export default function SolicitarAccesoPage() {
  return <SolicitarAccesoCliente />;
}
