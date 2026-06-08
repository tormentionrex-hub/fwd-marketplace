import { listarUsuarios } from "@/server/repositories/usuario.repository";

// Panel de administración (presentación / solo lectura).
// URL: /es/admin — protegido por (admin)/layout.tsx (rol admin).
export default async function AdminPage() {
  const usuarios = await listarUsuarios();

  const conteo = { estudiante: 0, empresario: 0, admin: 0 };
  for (const u of usuarios) {
    const rol = u.roles.nombre as keyof typeof conteo;
    if (rol in conteo) conteo[rol] += 1;
  }

  const tarjetas = [
    { rol: "Estudiantes", total: conteo.estudiante },
    { rol: "Empresarios", total: conteo.empresario },
    { rol: "Admins", total: conteo.admin },
  ];

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Panel de administración
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Usuarios registrados — vista de solo lectura.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tarjetas.map((t) => (
          <div
            key={t.rol}
            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500">{t.rol}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{t.total}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Registrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  Aún no hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.nombre}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {u.correo}
                  </td>
                  <td className="px-4 py-3 capitalize">{u.roles.nombre}</td>
                  <td className="px-4 py-3 capitalize">{u.estado}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {u.creado.toLocaleDateString("es-CR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
