import 'server-only';

// Extrae metadatos Open Graph de una URL para mostrar una tarjeta de preview
// (imagen + título + descripción + sitio) sin salir de nuestra página.
//
// Sin dependencias: descargamos el HTML y parseamos las <meta> con regex.
// Mismo criterio que el resto del proyecto (Cloudinary sin SDK).

export interface LinkPreview {
  url: string;
  titulo: string | null;
  descripcion: string | null;
  imagen: string | null;
  sitio: string | null;
  dominio: string | null;
}

// Detecta si una URL es de YouTube/Vimeo y devuelve la URL de embed, o null.
// Se usa para embeber el reproductor directamente en el feed.
export function urlEmbedVideo(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      // formato /shorts/<id> o /embed/<id>
      const m = u.pathname.match(/\/(?:shorts|embed)\/([\w-]+)/);
      if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === 'player.vimeo.com') return url;
  } catch {
    /* URL inválida */
  }
  return null;
}

function extraerMeta(html: string, propiedades: string[]): string | null {
  for (const prop of propiedades) {
    // Soporta orden property=...content=... y content=...property=...
    const patrones = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, 'i'),
    ];
    for (const re of patrones) {
      const m = html.match(re);
      if (m?.[1]) return decodeHtml(m[1].trim());
    }
  }
  return null;
}

function decodeHtml(texto: string): string {
  return texto
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');
}

// Descarga la URL y devuelve su preview Open Graph. Nunca lanza: ante cualquier
// fallo devuelve un preview mínimo (solo dominio) para no romper el flujo.
export async function obtenerLinkPreview(urlCruda: string): Promise<LinkPreview | null> {
  let url: URL;
  try {
    url = new URL(urlCruda);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const dominio = url.hostname.replace(/^www\./, '');
  const base: LinkPreview = {
    url: url.toString(),
    titulo: null,
    descripcion: null,
    imagen: null,
    sitio: dominio,
    dominio,
  };

  try {
    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), 6000);
    const res = await fetch(url.toString(), {
      signal: controlador.signal,
      redirect: 'follow',
      headers: {
        // Algunos sitios devuelven OG completo solo a user-agents de navegador/bots.
        'User-Agent': 'Mozilla/5.0 (compatible; FWDMarketplaceBot/1.0; +https://fwd-marketplace.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeout);

    const tipo = res.headers.get('content-type') ?? '';
    if (!res.ok || !tipo.includes('text/html')) return base;

    // Solo leemos el <head> (primeros ~200 KB) para no descargar páginas enteras.
    const buffer = await res.arrayBuffer();
    const html = new TextDecoder('utf-8').decode(buffer.slice(0, 200_000));

    const titulo =
      extraerMeta(html, ['og:title', 'twitter:title']) ??
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ??
      null;

    let imagen = extraerMeta(html, ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']);
    if (imagen && imagen.startsWith('/')) {
      imagen = `${url.protocol}//${url.host}${imagen}`;
    }

    return {
      ...base,
      titulo: titulo ? decodeHtml(titulo) : null,
      descripcion: extraerMeta(html, ['og:description', 'twitter:description', 'description']),
      imagen,
      sitio: extraerMeta(html, ['og:site_name']) ?? dominio,
    };
  } catch {
    return base;
  }
}
