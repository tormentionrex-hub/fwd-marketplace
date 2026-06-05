// Página de inicio de sesión.
// URL: /es/login
export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <form className="flex flex-col gap-4">
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
          Entrar
        </button>
      </form>
    </section>
  );
}
