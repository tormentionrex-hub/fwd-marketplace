'use client';

import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  FileSpreadsheet,
  Calendar,
  User,
  ShieldAlert,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';

interface ReporteFila {
  id: string;
  id_reportante: string;
  reportante_nombre: string;
  tipo_contenido: string;
  id_contenido: string;
  motivo: string;
  estado: string;
  id_moderador: string | null;
  moderador_nombre: string | null;
  resolucion: string | null;
  creado: string;
  actualizado: string;
}

interface AuditoriaFila {
  id: string;
  id_staff: string;
  nombre_staff: string;
  accion: string;
  detalles: unknown;
  justificacion: string | null;
  creado: string;
}

interface ReportesPanelProps {
  initialReportes: ReporteFila[];
  initialAuditorias: AuditoriaFila[];
  currentUserId: string;
}

type TabType = 'pendientes' | 'historial' | 'auditoria';

export function ReportesPanel({
  initialReportes,
  initialAuditorias,
  currentUserId,
}: ReportesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pendientes');
  const [reportes, setReportes] = useState<ReporteFila[]>(initialReportes);
  const [auditorias, setAuditorias] = useState<AuditoriaFila[]>(initialAuditorias);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('todos'); // for audit filters

  // Moderation modal state
  const [resolvingReport, setResolvingReport] = useState<ReporteFila | null>(null);
  const [justificacionModal, setJustificacionModal] = useState('');
  const [loadingResolucion, setLoadingResolucion] = useState(false);

  // Expanded audit logs details state
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  // Filters
  const pendientes = reportes.filter((r) => r.estado === 'pendiente' || r.estado === 'en_revision');
  const historialReportes = reportes.filter((r) => r.estado === 'resuelto' || r.estado === 'desestimado');

  const getFilteredReportes = (lista: ReporteFila[]) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return lista;
    return lista.filter(
      (r) =>
        r.reportante_nombre.toLowerCase().includes(query) ||
        r.motivo.toLowerCase().includes(query) ||
        r.tipo_contenido.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
    );
  };

  const getFilteredAuditorias = () => {
    const query = searchQuery.trim().toLowerCase();
    let lista = auditorias;

    if (selectedAction !== 'todos') {
      lista = lista.filter((a) => a.accion === selectedAction);
    }

    if (!query) return lista;
    return lista.filter(
      (a) =>
        a.nombre_staff.toLowerCase().includes(query) ||
        a.accion.toLowerCase().includes(query) ||
        (a.justificacion || '').toLowerCase().includes(query)
    );
  };

  const handleResolverReporte = async (accion: 'resuelto' | 'desestimado') => {
    if (!resolvingReport) return;

    const resolucionTrim = justificacionModal.trim();
    if (!resolucionTrim) {
      Swal.fire({
        icon: 'warning',
        title: 'Justificacion requerida',
        text: 'Debes detallar los motivos de esta resolucion.',
        confirmButtonColor: '#ec008c',
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
      return;
    }

    setLoadingResolucion(true);

    try {
      const res = await fetch('/api/admin/reportes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resolvingReport.id,
          accion,
          resolucion: resolucionTrim,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al resolver el reporte');
      }

      // Update state local
      setReportes((prev) =>
        prev.map((r) =>
          r.id === resolvingReport.id
            ? {
                ...r,
                estado: accion,
                resolucion: resolucionTrim,
                moderador_nombre: 'Staff', // local name representation
                actualizado: new Date().toISOString(),
              }
            : r
        )
      );

      // Append local audit entry to keep UI synchronised
      const nuevaAuditoria: AuditoriaFila = {
        id: Math.random().toString(36).substring(7),
        id_staff: currentUserId,
        nombre_staff: 'Staff',
        accion: `moderacion_${accion}`,
        justificacion: `Se marco como ${accion} el reporte ID ${resolvingReport.id}. Justificacion: ${resolucionTrim}`,
        detalles: { reportId: resolvingReport.id, action: accion },
        creado: new Date().toISOString(),
      };
      setAuditorias((prev) => [nuevaAuditoria, ...prev]);

      setResolvingReport(null);
      setJustificacionModal('');

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Reporte ${accion === 'resuelto' ? 'resuelto' : 'desestimado'} con exito`,
        showConfirmButton: false,
        timer: 3000,
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo procesar la resolución.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#008fd4',
        background: 'var(--adm-card)',
        color: 'var(--adm-ink)',
      });
    } finally {
      setLoadingResolucion(false);
    }
  };

  // CSV Export functions
  const exportarReportesCSV = () => {
    const headers = ['ID', 'Reportante', 'Tipo Contenido', 'ID Contenido', 'Motivo', 'Estado', 'Moderador', 'Resolucion', 'Creado'];
    const rows = reportes.map((r) => [
      r.id,
      r.reportante_nombre,
      r.tipo_contenido,
      r.id_contenido,
      r.motivo.replace(/"/g, '""'),
      r.estado,
      r.moderador_nombre || '',
      (r.resolucion || '').replace(/"/g, '""'),
      r.creado,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reportes_moderacion_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarAuditoriasCSV = () => {
    const headers = ['ID', 'Staff ID', 'Nombre Staff', 'Accion', 'Justificacion', 'Fecha'];
    const rows = auditorias.map((a) => [
      a.id,
      a.id_staff,
      a.nombre_staff,
      a.accion,
      (a.justificacion || '').replace(/"/g, '""'),
      a.creado,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registro_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const listaAccionesDisponibles = Array.from(new Set(auditorias.map((a) => a.accion)));

  return (
    <div className="space-y-6">
      {/* Top Header Buttons and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs Selector */}
        <div className="flex border-b border-white/10 gap-2">
          <button
            onClick={() => {
              setActiveTab('pendientes');
              setSearchQuery('');
            }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'pendientes'
                ? 'border-fwd-turquoise text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            Reportes Pendientes ({pendientes.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('historial');
              setSearchQuery('');
            }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'historial'
                ? 'border-fwd-turquoise text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            Historial de Moderación
          </button>
          <button
            onClick={() => {
              setActiveTab('auditoria');
              setSearchQuery('');
            }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'auditoria'
                ? 'border-fwd-turquoise text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            Bitácora de Auditoría
          </button>
        </div>

        {/* Export action */}
        {activeTab !== 'pendientes' && (
          <button
            onClick={activeTab === 'historial' ? exportarReportesCSV : exportarAuditoriasCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white hover:bg-white/[0.08] transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-fwd-turquoise" />
            Exportar a CSV
          </button>
        )}
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder={
              activeTab === 'auditoria'
                ? 'Buscar por staff, accion o justificante...'
                : 'Buscar reportes...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-fwd-turquoise focus:outline-none"
          />
        </div>

        {activeTab === 'auditoria' && listaAccionesDisponibles.length > 0 && (
          <div className="w-full sm:w-60">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-fwd-turquoise focus:outline-none [&>option]:bg-[#0f172a]"
            >
              <option value="todos">Todos los eventos</option>
              {listaAccionesDisponibles.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main tables */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        {activeTab === 'pendientes' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                <th className="px-5 py-3">Reportante</th>
                <th className="px-5 py-3">Contenido</th>
                <th className="px-5 py-3">ID Contenido</th>
                <th className="px-5 py-3">Motivo</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-white/80">
              {getFilteredReportes(pendientes).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/40">
                    No hay reportes pendientes de moderación.
                  </td>
                </tr>
              ) : (
                getFilteredReportes(pendientes).map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-white/[0.01]">
                    <td className="px-5 py-4 font-semibold text-white">{r.reportante_nombre}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-fwd-purple/20 px-2.5 py-0.5 text-xs font-semibold text-fwd-purple">
                        {r.tipo_contenido}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-white/40 tabular-nums">
                      {r.id_contenido}
                    </td>
                    <td className="px-5 py-4 text-white/75 max-w-xs truncate" title={r.motivo}>
                      {r.motivo}
                    </td>
                    <td className="px-5 py-4 text-xs text-white/45 whitespace-nowrap">
                      {new Date(r.creado).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setResolvingReport(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#ec008c] px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-fwd-magenta/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Moderar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'historial' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                <th className="px-5 py-3">Reportante</th>
                <th className="px-5 py-3">Contenido</th>
                <th className="px-5 py-3">Motivo</th>
                <th className="px-5 py-3">Resolución / Justificante</th>
                <th className="px-5 py-3">Moderador</th>
                <th className="px-5 py-3 text-center">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-white/80">
              {getFilteredReportes(historialReportes).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/40">
                    No se encontraron reportes moderados en el historial.
                  </td>
                </tr>
              ) : (
                getFilteredReportes(historialReportes).map((r) => {
                  const esResuelto = r.estado === 'resuelto';
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-white/[0.01] opacity-75">
                      <td className="px-5 py-4 font-semibold text-white">{r.reportante_nombre}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/60">
                          {r.tipo_contenido}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/60 text-xs max-w-xs truncate" title={r.motivo}>
                        {r.motivo}
                      </td>
                      <td className="px-5 py-4 text-white/90 text-xs font-medium max-w-xs truncate" title={r.resolucion || ''}>
                        {r.resolucion}
                      </td>
                      <td className="px-5 py-4 text-xs text-white/60 font-semibold">
                        {r.moderador_nombre || 'Desconocido'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            esResuelto
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-slate-500/10 text-white/60'
                          }`}
                        >
                          {esResuelto ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Resuelto
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> Desestimado
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'auditoria' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                <th className="px-5 py-3">Staff</th>
                <th className="px-5 py-3">Acción ejecutada</th>
                <th className="px-5 py-3">Detalle / Justificación</th>
                <th className="px-5 py-3">Fecha del suceso</th>
                <th className="px-5 py-3 text-right">Datos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-white/80">
              {getFilteredAuditorias().length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-white/40">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              ) : (
                getFilteredAuditorias().map((a) => {
                  const expandida = expandedAuditId === a.id;
                  return (
                    <tr
                      key={a.id}
                      className={`transition-all ${
                        expandida ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-fwd-turquoise" />
                          <span className="font-semibold text-white">{a.nombre_staff}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded bg-[#008fd4]/10 px-2 py-0.5 text-xs font-bold text-fwd-blue">
                          {a.accion}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-white/70 max-w-sm">
                        <p>{a.justificacion}</p>
                        {expandida && a.detalles !== null && a.detalles !== undefined && (
                          <div className="mt-2.5 animate-fadeIn">
                            <pre className="text-[10px] bg-[#090d16] p-3 rounded-lg border border-white/5 font-mono overflow-auto max-h-32 text-fwd-turquoise">
                              {JSON.stringify(a.detalles, null, 2)}
                            </pre>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-white/45 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(a.creado).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {a.detalles !== null && a.detalles !== undefined ? (
                          <button
                            onClick={() => setExpandedAuditId(expandida ? null : a.id)}
                            className="text-white/40 hover:text-white p-1 rounded transition-colors"
                            title={expandida ? 'Ocultar JSON' : 'Ver JSON'}
                          >
                            {expandida ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <span className="text-white/20">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Moderation dialog modal overlay */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-fwd-magenta" />
                Moderación de Contenido
              </h3>
              <button
                onClick={() => {
                  setResolvingReport(null);
                  setJustificacionModal('');
                }}
                className="rounded-lg p-1 text-white/40 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-white/[0.03] p-4 text-xs space-y-2 border border-white/5">
                <div className="flex justify-between">
                  <span className="font-semibold text-white/50">Reportado por:</span>
                  <span className="text-white font-medium">{resolvingReport.reportante_nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-white/50">Tipo Contenido:</span>
                  <span className="text-white font-mono uppercase bg-fwd-purple/20 px-1.5 py-0.5 rounded text-[10px] text-fwd-purple">
                    {resolvingReport.tipo_contenido}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-white/50">ID Contenido:</span>
                  <span className="text-white font-mono tabular-nums select-all">{resolvingReport.id_contenido}</span>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <span className="font-semibold block text-white/50 mb-1">Motivo / Descripción:</span>
                  <p className="text-white/80 bg-black/10 p-2.5 rounded italic leading-relaxed text-xs">
                    &ldquo;{resolvingReport.motivo}&rdquo;
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                  Justificación de Resolución
                </label>
                <textarea
                  placeholder="Detalla detalladamente por qué aplicas esta resolución..."
                  value={justificacionModal}
                  onChange={(e) => setJustificacionModal(e.target.value)}
                  className="w-full h-24 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs text-white placeholder-white/30 focus:border-fwd-turquoise focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={loadingResolucion}
                  onClick={() => handleResolverReporte('desestimado')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 text-white/60" />
                  Desestimar Reporte
                </button>

                <button
                  type="button"
                  disabled={loadingResolucion}
                  onClick={() => handleResolverReporte('resuelto')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#ec008c] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-fwd-magenta/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {loadingResolucion ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Marcar como Resuelto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
