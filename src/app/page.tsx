import { redirect } from "next/navigation";

export default function Home() {
  // Mientras se construye el marketplace, la raíz lleva al inicio de sesión.
  redirect("/login");
}
