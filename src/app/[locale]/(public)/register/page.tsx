// Página de registro de nuevos usuarios.
// URL: /es/register
export default function RegisterPage() {
  return (
    <section className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nombre completo"
          className="h-11 rounded-md border border-black/[.12] px-3 dark:border-white/[.18] dark:bg-transparent"
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          className="h-11 rounded-md border border-black/[.12] px-3 dark:border-white/[.18] dark:bg-transparent"
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="h-11 rounded-md border border-black/[.12] px-3 dark:border-white/[.18] dark:bg-transparent"
        />
        <button
          type="submit"
          className="h-11 rounded-full bg-foreground text-background transition-colors hover:opacity-90"
        >
          Registrarme
        </button>
      </form>
    </section>
  );
}
