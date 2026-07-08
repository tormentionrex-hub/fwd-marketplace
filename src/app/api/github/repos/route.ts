import { NextResponse } from 'next/server';
import { normalizarUsuarioGithub } from '@/lib/empleabilidad';

// GET /api/github/repos?u=usuario
// Devuelve el usuario de GitHub (existe? avatar/nombre) y sus repositorios
// PÚBLICOS. La API pública de GitHub, sin autenticación, SOLO expone repos
// públicos: los privados nunca se pueden ver por acá. Se cachea 1h por usuario.
const GH_HEADERS = { Accept: 'application/vnd.github+json', 'User-Agent': 'fwd-marketplace' };

interface RepoDTO {
  nombre: string;
  descripcion: string | null;
  url: string;
  estrellas: number;
  lenguaje: string | null;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('u') ?? '';
  const usuario = normalizarUsuarioGithub(raw);

  if (!usuario || !/^[a-zA-Z0-9-]{1,39}$/.test(usuario)) {
    return NextResponse.json({ ok: false, error: 'usuario_invalido' });
  }

  try {
    const resUser = await fetch(`https://api.github.com/users/${usuario}`, {
      headers: GH_HEADERS,
      next: { revalidate: 3600 },
    });
    if (resUser.status === 404) return NextResponse.json({ ok: false, error: 'no_existe' });
    if (!resUser.ok) return NextResponse.json({ ok: false, error: 'github_error' });
    const user = (await resUser.json()) as Record<string, unknown>;

    const resRepos = await fetch(
      `https://api.github.com/users/${usuario}/repos?sort=updated&per_page=12&type=owner`,
      { headers: GH_HEADERS, next: { revalidate: 3600 } },
    );
    const reposRaw: unknown = resRepos.ok ? await resRepos.json() : [];
    const lista = Array.isArray(reposRaw) ? (reposRaw as Record<string, unknown>[]) : [];
    const repos: RepoDTO[] = lista
      .filter((r) => r.fork !== true)
      .slice(0, 6)
      .map((r) => ({
        nombre: str(r.name),
        descripcion: typeof r.description === 'string' ? r.description : null,
        url: str(r.html_url),
        estrellas: num(r.stargazers_count),
        lenguaje: typeof r.language === 'string' ? r.language : null,
      }));

    return NextResponse.json({
      ok: true,
      usuario,
      nombre: str(user.name) || usuario,
      avatar: typeof user.avatar_url === 'string' ? user.avatar_url : null,
      url: str(user.html_url) || `https://github.com/${usuario}`,
      reposPublicos: num(user.public_repos),
      repos,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'red' });
  }
}
