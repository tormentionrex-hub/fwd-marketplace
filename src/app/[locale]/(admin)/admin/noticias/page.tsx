import { AdminPageShell, AdminPageHeader } from "@/components/features/admin/admin-page-header";
import { listarParaModeracion } from "@/server/services/noticia.service";
import AdminNoticiasPanel from "@/components/features/admin/admin-noticias-panel";

export const dynamic = "force-dynamic";

// URL: /es/admin/noticias — moderación del foro de noticias.
export default async function AdminNoticiasPage() {
  const noticias = await listarParaModeracion();

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Noticias"
        subtitle="Moderá el foro de la comunidad: ocultá o eliminá publicaciones inapropiadas."
      />
      <AdminNoticiasPanel inicial={noticias} />
    </AdminPageShell>
  );
}
