'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Props {
  proyectoId: string;
  empresario: string;
  calificacionInicial: { puntuacion: number; comentario: string } | null;
}

export default function CalificarEmpresa({ proyectoId, empresario, calificacionInicial }: Props) {
  const [puntuacion, setPuntuacion] = useState(calificacionInicial?.puntuacion ?? 0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState(calificacionInicial?.comentario ?? '');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(calificacionInicial !== null);
  const [errorMsg, setErrorMsg] = useState('');

  async function enviar() {
    if (puntuacion === 0) {
      setErrorMsg('Selecciona una puntuación.');
      return;
    }
    if (comentario.trim().length < 10) {
      setErrorMsg('El comentario debe tener al menos 10 caracteres.');
      return;
    }
    setErrorMsg('');
    setEnviando(true);
    try {
      const res = await fetch(`/api/proyectos/${proyectoId}/calificar-empresa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puntuacion, comentario: comentario.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg((data as { message?: string }).message ?? 'Error al enviar la calificación.');
      } else {
        setEnviado(true);
      }
    } catch {
      setErrorMsg('Error de red. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <Card className="flex flex-col gap-3 p-6">
        <h3 className="font-display text-lg font-bold text-text">Tu calificación fue enviada</h3>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              width={20}
              height={20}
              className={s <= puntuacion ? 'fill-amber-400 text-amber-400' : 'text-surface-2'}
            />
          ))}
        </div>
        {comentario && <p className="text-sm text-text-muted">{comentario}</p>}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <h3 className="font-display text-lg font-bold text-text">Califica a {empresario}</h3>
        <p className="mt-1 text-sm text-text-muted">
          Comparte tu experiencia trabajando con esta empresa. Tu opinion ayuda a otros estudiantes
          a tomar mejores decisiones y mejora la reputacion del cliente.
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-text">Puntuacion</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPuntuacion(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="rounded p-0.5 focus:outline-none"
              aria-label={`${s} estrella${s > 1 ? 's' : ''}`}
            >
              <Star
                width={28}
                height={28}
                className={
                  s <= (hover || puntuacion)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-surface-2 hover:text-amber-300'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text" htmlFor="comentario-empresa">
          Comentario <span className="text-text-muted">(minimo 10 caracteres)</span>
        </label>
        <textarea
          id="comentario-empresa"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Describe brevemente tu experiencia con la empresa..."
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-fwd-azul"
        />
        <p className="mt-1 text-right text-xs text-text-muted">{comentario.length}/500</p>
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <Button onClick={enviar} disabled={enviando} className="self-start">
        {enviando ? 'Enviando...' : 'Enviar calificacion'}
      </Button>
    </Card>
  );
}
