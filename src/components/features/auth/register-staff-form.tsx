'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { TextField } from '@/components/ui/text-field';
import { IconArrowRight, IconArrowLeft, IconCheck } from '@/components/ui/icons';
import { Shield } from 'lucide-react';
import gsap from 'gsap';

type Step = 'email' | 'datos';

const FWD_COLORS = ['#20BEC6', '#ED008C', '#662D91', '#008FD5', '#FFCB05'];

function AnimatedHeading({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll<HTMLSpanElement>('.reg-char');
    gsap.fromTo(
      chars,
      { opacity: 0, y: 30, rotateX: -60 },
      { opacity: 1, y: 0, rotateX: 0, stagger: 0.03, duration: 0.55, ease: 'back.out(1.4)', delay: 0.1 }
    );
  }, []);

  return (
    <h1 ref={ref} className="font-display text-3xl font-black text-fwd-ink animate-scaleUp" style={{ perspective: '500px' }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="reg-char inline-block cursor-default"
          style={{ whiteSpace: 'pre' }}
          onMouseEnter={(e) =>
            gsap.to(e.currentTarget, {
              y: -8,
              color: FWD_COLORS[i % FWD_COLORS.length] ?? '#20BEC6',
              scale: 1.15,
              duration: 0.15,
              ease: 'power2.out',
            })
          }
          onMouseLeave={(e) =>
            gsap.to(e.currentTarget, {
              y: 0,
              color: '#1a1633',
              scale: 1,
              duration: 0.35,
              ease: 'elastic.out(1,0.5)',
            })
          }
        >
          {char}
        </span>
      ))}
    </h1>
  );
}

function RegisterStaffFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailVerificado, setEmailVerificado] = useState('');
  const [tipoStaff, setTipoStaff] = useState('');

  // Prefill email if provided in query param
  const [emailInput, setEmailInput] = useState(initialEmail);

  useEffect(() => {
    if (initialEmail) {
      setEmailInput(initialEmail);
    }
  }, [initialEmail]);

  // Step 1: verify email invitation
  async function handleVerificarEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setError('Por favor escribe tu email.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verificar-invitacion-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || 'Error al verificar la invitación de staff.');
        return;
      }

      setEmailVerificado(email);
      setTipoStaff(data?.tipo_staff || 'moderador');
      setStep('datos');
    } catch {
      setError('Error de red. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: create staff account
  async function handleRegistro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const passwordConfirm = String(formData.get('passwordConfirm') ?? '');

    if (!firstName || !lastName) {
      setError('Por favor completa tu nombre y apellido.');
      setLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: emailVerificado,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || 'No se pudo completar el registro de staff.');
        return;
      }

      if (data?.perfil) {
        localStorage.setItem('fwd_perfil', JSON.stringify(data.perfil));
        sessionStorage.setItem('fwd_active', 'true');
      }

      router.push(data?.redirectTo || '/admin');
      router.refresh();
    } catch {
      setError('Error de red. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'email') {
    return (
      <div>
        <header className="mb-8">
          <AnimatedHeading text="Registro de Staff" />
          <p className="mt-2 text-sm text-fwd-ink/60">
            Módulo exclusivo para personal autorizado. Ingresa el correo con el que fuiste invitado.
          </p>
        </header>

        <form onSubmit={handleVerificarEmail} className="flex flex-col gap-5">
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-fwd-ink">
              Correo de Invitación
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full rounded-xl border border-fwd-ink/20 px-4 py-3 text-sm text-fwd-ink focus:border-fwd-blue focus:outline-none"
              autoComplete="email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-6 font-semibold text-white shadow-sm transition hover:bg-fwd-purple disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Verificando…' : 'Validar Invitación'}
            <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-fwd-ink/60">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-fwd-blue hover:text-fwd-purple transition">
            Inicia sesión
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200">
          <IconCheck className="h-4 w-4" />
          <span>Verificado: {emailVerificado}</span>
        </div>
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-fwd-purple/10 px-3 py-1 text-xs font-bold text-fwd-purple">
          <Shield className="h-3.5 w-3.5" />
          <span>Rol Staff: {tipoStaff === 'admin_general' ? 'Administrador General' : 'Moderador'}</span>
        </div>
        <h1 className="font-display text-3xl font-black text-fwd-ink">
          Completa tu Registro
        </h1>
        <p className="mt-2 text-sm text-fwd-ink/60">
          Crea tus credenciales de acceso para empezar a operar.
        </p>
      </header>

      <form onSubmit={handleRegistro} className="flex flex-col gap-5">
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            id="firstName"
            name="firstName"
            label="Nombre"
            placeholder="Ana"
            autoComplete="given-name"
            minLength={2}
            maxLength={50}
            required
          />
          <TextField
            id="lastName"
            name="lastName"
            label="Apellido"
            placeholder="Mora"
            autoComplete="family-name"
            minLength={2}
            maxLength={50}
            required
          />
        </div>

        <TextField
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />

        <TextField
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          label="Confirmar contraseña"
          placeholder="Repetí la contraseña"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-full bg-fwd-blue px-6 font-semibold text-white shadow-sm transition hover:bg-fwd-purple disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Creando cuenta…' : 'Finalizar Registro'}
          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={() => {
            setStep('email');
            setError(null);
          }}
          className="inline-flex items-center justify-center gap-1.5 text-sm text-fwd-ink/50 hover:text-fwd-ink transition"
        >
          <IconArrowLeft className="h-4 w-4" />
          Cambiar correo
        </button>
      </form>
    </div>
  );
}

export function RegisterStaffForm() {
  return (
    <Suspense fallback={<div className="text-sm text-fwd-ink/50">Cargando formulario...</div>}>
      <RegisterStaffFormInner />
    </Suspense>
  );
}
