import { getUser } from '@/server/auth/get-user';
import {
  listarTecnologias,
  listarHabilidades,
  listarCategoriasNegocio,
} from '@/server/repositories/catalog.repository';
import {
  AdminPageShell,
  AdminPageHeader,
} from '@/components/features/admin/admin-page-header';
import { CatalogosPanel } from '@/components/features/admin/catalogos-panel';
import { redirect } from 'next/navigation';

export default async function AdminCatalogosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();

  if (!user || (user.roles.nombre !== 'admin' && user.roles.nombre !== 'staff')) {
    redirect(`/${locale}/login`);
  }

  const [tecnologiasRaw, habilidadesRaw, categoriasRaw] = await Promise.all([
    listarTecnologias(),
    listarHabilidades(),
    listarCategoriasNegocio(),
  ]);

  // Convert BigInt IDs to numbers to prevent hydration/serialization errors
  const tecnologias = tecnologiasRaw.map((t) => ({
    id: Number(t.id),
    nombre: t.nombre,
    activa: t.activa,
  }));

  const habilidades = habilidadesRaw.map((h) => ({
    id: Number(h.id),
    nombre: h.nombre,
    categoria: h.categoria,
    activa: h.activa,
  }));

  const categoriasNegocio = categoriasRaw.map((c) => ({
    id: Number(c.id),
    nombre: c.nombre,
    activa: c.activa,
  }));

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Catálogos del Sistema"
        subtitle="Administrá las tecnologías, habilidades y categorías de negocio disponibles en la plataforma."
      />
      <CatalogosPanel
        initialTecnologias={tecnologias}
        initialHabilidades={habilidades}
        initialCategoriasNegocio={categoriasNegocio}
        tipoStaff={user.tipo_staff ?? ''}
      />
    </AdminPageShell>
  );
}
