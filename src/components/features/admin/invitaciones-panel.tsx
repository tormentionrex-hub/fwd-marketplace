'use client';

import { useState } from 'react';
import {
  UserPlus,
  Mail,
  Shield,
  Clock,
  Search,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';

interface StaffMember {
  id: string;
  nombre: string;
  correo: string;
  tipo_staff: string | null;
  creado: string;
  estado: string;
}

interface StaffInvitation {
  id: string;
  email: string;
  tipo_staff: string;
  pending: boolean;
  solicitado: string;
}

interface InvitacionesPanelProps {
  initialStaff: StaffMember[];
  initialInvitations: StaffInvitation[];
}

export function InvitacionesPanel({
  initialStaff,
  initialInvitations,
}: InvitacionesPanelProps) {
  const [staff] = useState<StaffMember[]>(initialStaff);
  const [invitations, setInvitations] = useState<StaffInvitation[]>(initialInvitations);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [tipoStaff, setTipoStaff] = useState<'admin_general' | 'moderador'>('moderador');

  const getFilteredStaff = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return staff;
    return staff.filter(
      (s) =>
        s.nombre.toLowerCase().includes(query) ||
        s.correo.toLowerCase().includes(query) ||
        (s.tipo_staff || '').toLowerCase().includes(query)
    );
  };

  const getFilteredInvitations = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return invitations;
    return invitations.filter(
      (i) =>
        i.email.toLowerCase().includes(query) ||
        i.tipo_staff.toLowerCase().includes(query)
    );
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim) return;

    setLoading(true);

    try {
      const res = await fetch('/api/admin/invitaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrim, tipo_staff: tipoStaff }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al enviar invitación');
      }

      // Add to local state
      const newInv: StaffInvitation = {
        id: Math.random().toString(36).substring(7),
        email: emailTrim,
        tipo_staff: tipoStaff,
        pending: true,
        solicitado: new Date().toISOString(),
      };

      setInvitations((prev) => [newInv, ...prev]);
      setEmail('');
      setIsModalOpen(false);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Invitacion enviada con exito',
        showConfirmButton: false,
        timer: 3000,
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo enviar la invitación de staff.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#ec008c',
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = getFilteredStaff();
  const filteredInvitations = getFilteredInvitations();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top action block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-fwd-turquoise focus:outline-none"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-fwd px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-fwd-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Invitar Miembro
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Staff list roster */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-fwd-turquoise" />
            Equipo Activo ({staff.length})
          </h3>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Correo</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Registro</th>
                  <th className="px-5 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-white/80">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-white/40">
                      No se encontraron miembros del staff.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-white/[0.01]">
                      <td className="px-5 py-3.5 font-semibold text-white">{s.nombre}</td>
                      <td className="px-5 py-3.5 text-white/60 font-mono text-xs">{s.correo}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            s.tipo_staff === 'admin_general'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-[#008fd4]/10 text-fwd-blue'
                          }`}
                        >
                          {s.tipo_staff === 'admin_general' ? 'Super Admin' : 'Moderador'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white/40">
                        {new Date(s.creado).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            s.estado === 'activo'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {s.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending invitations sidebar list */}
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-fwd-magenta" />
            Invitaciones Pendientes ({invitations.length})
          </h3>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3 text-center">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-white/80">
                {filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-5 py-8 text-center text-white/40">
                      No hay invitaciones pendientes.
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((inv) => (
                    <tr key={inv.id} className="transition-colors hover:bg-white/[0.01]">
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white/85 text-xs truncate max-w-[140px] sm:max-w-none" title={inv.email}>
                            {inv.email}
                          </span>
                          <span className="text-[10px] text-white/40">
                            Enviado:{' '}
                            {new Date(inv.solicitado).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/60">
                          {inv.tipo_staff === 'admin_general' ? 'Admin' : 'Mod'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invitation Dialog Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-fwd-turquoise" />
                Invitar nuevo Staff
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEmail('');
                }}
                className="rounded-lg p-1 text-white/40 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvitation} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    disabled={loading}
                    placeholder="nombre@fwdcr.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-10 pr-3.5 text-sm text-white placeholder-white/30 focus:border-fwd-turquoise focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                  Rol de Operaciones
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
                    <Shield className="h-4 w-4" />
                  </span>
                  <select
                    disabled={loading}
                    value={tipoStaff}
                    onChange={(e) => setTipoStaff(e.target.value as 'admin_general' | 'moderador')}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-10 pr-3.5 text-sm text-white focus:border-fwd-turquoise focus:outline-none [&>option]:bg-[#111827]"
                  >
                    <option value="moderador">Moderador (Lectura y Moderación)</option>
                    <option value="admin_general">Super Admin (Gestión Completa)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEmail('');
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-fwd px-4 py-2 text-xs font-bold text-white shadow-lg shadow-fwd-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Enviar invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
