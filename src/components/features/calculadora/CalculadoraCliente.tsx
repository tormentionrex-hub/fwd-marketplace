"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Briefcase,
  Layers,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { toastExito, alertaError, confirmarEliminacion } from "@/lib/sweetalert-admin";
import type { MiOfertaDTO } from "@/types/oferta";
import type { MiPostulacionDTO } from "@/types/vacante";
import { calcularDetalleCotizacion, type DesgloseCalculo } from "@/lib/cotizaciones";

interface CotizacionGuardada {
  id: string;
  id_estudiante: string;
  nombre_proyecto: string;
  descripcion: string | null;
  duracion_semanas: number;
  horas_estimadas: number;
  complejidad: "baja" | "media" | "alta";
  stack: string[];
  funcionalidades: Array<{ nombre: string; horas: number }>;
  tarifa_base_hora: number;
  modalidad: "remoto" | "hibrido" | "presencial";
  iva: boolean;
  rango_min: number;
  rango_estimado: number;
  rango_max: number;
  moneda: "USD" | "CRC";
  desglose: DesgloseCalculo;
  explicacion_ia: string | null;
  creado: string;
  actualizado: string;
  id_proyecto: string | null;
  id_postulacion: string | null;
  proyectos: { id: string; titulo: string } | null;
  postulaciones: { id: string; vacantes: { id: string; titulo: string } | null } | null;
}

interface CalculadoraClienteProps {
  locale: string;
  ofertas: MiOfertaDTO[];
  postulaciones: MiPostulacionDTO[];
}

const TECHS_PREDEFINIDAS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Supabase",
  "Tailwind CSS",
  "Prisma",
  "Python",
  "FastAPI",
  "MongoDB",
  "Docker",
  "AWS",
  "Figma",
  "Firebase",
  "Git / GitHub",
];

export default function CalculadoraCliente({
  locale: _locale,
  ofertas,
  postulaciones,
}: CalculadoraClienteProps) {
  // Pestaña activa
  const [tabActiva, setTabActiva] = useState<"calculadora" | "guardadas">("calculadora");

  // --- Estados del Formulario ---
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [duracionSemanas, setDuracionSemanas] = useState(4);
  const [horasEstimadas, setHorasEstimadas] = useState(60);
  const [tarifaBaseHora, setTarifaBaseHora] = useState(15);
  const [complejidad, setComplejidad] = useState<"baja" | "media" | "alta">("media");
  const [modalidad, setModalidad] = useState<"remoto" | "hibrido" | "presencial">("remoto");
  const [moneda, setMoneda] = useState<"USD" | "CRC">("USD");
  const [iva, setIva] = useState(false);
  const [selectedTechs, setSelectedTechs] = useState<string[]>(["React", "TypeScript", "Tailwind CSS"]);
  
  // Funcionalidades (desglose)
  const [funcionalidades, setFuncionalidades] = useState<{ nombre: string; horas: number }[]>([
    { nombre: "Maquetación de vistas principales", horas: 15 },
    { nombre: "Configuración de Base de Datos y API", horas: 20 },
    { nombre: "Módulo de autenticación", horas: 10 },
    { nombre: "Integración y pruebas", horas: 15 },
  ]);
  const [nuevaFunNombre, setNuevaFunNombre] = useState("");
  const [nuevaFunHoras, setNuevaFunHoras] = useState(8);
  const [sincronizarHoras, setSincronizarHoras] = useState(true);

  // Vincular cotización
  const [vinculo, setVinculo] = useState(""); // formato: "proyecto_[id]" o "postulacion_[id]"

  // Justificación e Info IA
  const [explicacionIa, setExplicacionIa] = useState<string | null>(null);
  const [rangoReferenciaIa, setRangoReferenciaIa] = useState<string | null>(null);
  const [cargandoIa, setCargandoIa] = useState(false);

  // --- Estados de Cotizaciones Guardadas ---
  const [cotizacionesGuardadas, setCotizacionesGuardadas] = useState<CotizacionGuardada[]>([]);
  const [cargandoGuardadas, setCargandoGuardadas] = useState(false);
  const [cotizacionExpandida, setCotizacionExpandida] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // --- Cálculo en tiempo real (Cliente) ---
  const desgloseLive = calcularDetalleCotizacion(
    horasEstimadas,
    tarifaBaseHora,
    complejidad,
    modalidad,
    selectedTechs.length,
    iva,
    moneda
  );

  // Sincronizar horas totales cuando cambia funcionalidades y está activa la sincronización
  useEffect(() => {
    if (sincronizarHoras && funcionalidades.length > 0) {
      const total = funcionalidades.reduce((acc, f) => acc + f.horas, 0);
      setHorasEstimadas(total);
      // Calcular semanas aproximadas asumiendo 15 horas por semana para junior
      const semanas = Math.max(Math.round((total / 15) * 10) / 10, 1);
      setDuracionSemanas(semanas);
    }
  }, [funcionalidades, sincronizarHoras]);

  // Cargar cotizaciones al montar o cambiar pestaña
  useEffect(() => {
    if (tabActiva === "guardadas") {
      cargarCotizaciones();
    }
  }, [tabActiva]);

  const cargarCotizaciones = async () => {
    setCargandoGuardadas(true);
    try {
      const res = await fetch("/api/cotizaciones");
      if (!res.ok) throw new Error("Error de red");
      const data = await res.json();
      if (data.ok) {
        setCotizacionesGuardadas(data.cotizaciones || []);
      }
    } catch (e) {
      console.error(e);
      alertaError("No se pudieron cargar tus cotizaciones guardadas.", "Error");
    } finally {
      setCargandoGuardadas(false);
    }
  };

  // --- Manejo del Formulario ---
  const toggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter((t) => t !== tech));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  const agregarFuncionalidad = () => {
    if (!nuevaFunNombre.trim()) {
      alertaError("Escribe el nombre de la funcionalidad.", "Validación");
      return;
    }
    if (nuevaFunHoras <= 0) {
      alertaError("Las horas estimadas deben ser mayor a 0.", "Validación");
      return;
    }
    setFuncionalidades([
      ...funcionalidades,
      { nombre: nuevaFunNombre.trim(), horas: Number(nuevaFunHoras) },
    ]);
    setNuevaFunNombre("");
    setNuevaFunHoras(8);
    toastExito("Funcionalidad agregada");
  };

  const eliminarFuncionalidad = (idx: number) => {
    setFuncionalidades(funcionalidades.filter((_, i) => i !== idx));
  };

  // --- Estimación IA ---
  const estimarConIA = async () => {
    if (!descripcion.trim() || descripcion.trim().length < 10) {
      alertaError(
        "Por favor escribe una descripción del proyecto en el campo 'Descripción del Proyecto' (mínimo 10 caracteres) antes de estimar con IA.",
        "Descripción requerida"
      );
      return;
    }

    setCargandoIa(true);
    try {
      const res = await fetch("/api/cotizaciones/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: descripcion.trim(),
          stack: selectedTechs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensaje || "Error al conectar con la IA");
      }

      if (data.ok && data.resultado) {
        const r = data.resultado;
        setHorasEstimadas(r.horasEstimadas);
        setComplejidad(r.complejidad);
        setModalidad(r.modalidad);
        setFuncionalidades(r.funcionalidades);
        setExplicacionIa(r.explicacion);
        setRangoReferenciaIa(r.rangoReferencia);
        setSincronizarHoras(true);

        toastExito("Estimación completada por el asistente IA");
      }
    } catch (e: unknown) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      alertaError(errorMsg, "Error Asistente IA");
    } finally {
      setCargandoIa(false);
    }
  };

  // --- Guardar Cotización ---
  const guardarCotizacion = async () => {
    if (!nombreProyecto.trim()) {
      alertaError("Por favor ingresa un nombre para el proyecto.", "Validación");
      return;
    }
    if (horasEstimadas <= 0) {
      alertaError("Las horas estimadas totales deben ser mayores a 0.", "Validación");
      return;
    }

    setGuardando(true);

    // Separar vínculo
    let idProyecto: string | null = null;
    let idPostulacion: string | null = null;

    if (vinculo.startsWith("proyecto_")) {
      idProyecto = vinculo.replace("proyecto_", "");
    } else if (vinculo.startsWith("postulacion_")) {
      idPostulacion = vinculo.replace("postulacion_", "");
    }

    const payload = {
      nombreProyecto: nombreProyecto.trim(),
      descripcion: descripcion.trim() || null,
      duracionSemanas: Number(duracionSemanas),
      horasEstimadas: Number(horasEstimadas),
      complejidad,
      stack: selectedTechs,
      funcionalidades,
      tarifaBaseHora: Number(tarifaBaseHora),
      modalidad,
      iva,
      moneda,
      idProyecto,
      idPostulacion,
    };

    try {
      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al guardar");

      if (data.ok) {
        toastExito(`Cotización "${data.nombre}" guardada correctamente`);
        // Reset campos básicos
        setNombreProyecto("");
        setDescripcion("");
        setVinculo("");
        setExplicacionIa(null);
        setRangoReferenciaIa(null);
        // Cambiar a la lista
        setTabActiva("guardadas");
      }
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      alertaError(errorMsg, "Error");
    } finally {
      setGuardando(false);
    }
  };

  // --- Eliminar Cotización ---
  const borrarCotizacion = async (id: string, nombre: string) => {
    const confirmado = await confirmarEliminacion({
      titulo: "¿Eliminar cotización?",
      texto: `¿Seguro que deseas eliminar la cotización "${nombre}"? Esta acción no se puede deshacer.`,
      confirmText: "Sí, eliminar",
    });

    if (!confirmado) return;

    try {
      const res = await fetch(`/api/cotizaciones?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al eliminar");

      toastExito("Cotización eliminada correctamente");
      cargarCotizaciones();
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      alertaError(errorMsg, "Error");
    }
  };

  // Helpers de visualización monetaria
  const fmt = (val: number, cur: string) => {
    const symbol = cur === "CRC" ? "₡" : "$";
    return `${symbol}${new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 }).format(Math.round(val))}`;
  };

  return (
    <div className="space-y-6">
      {/* Selector de pestañas */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTabActiva("calculadora")}
          className={`px-6 py-3 font-display text-sm font-semibold tracking-tight transition-all relative ${
            tabActiva === "calculadora"
              ? "text-fwd-morado dark:text-purple-300"
              : "text-text-muted hover:text-text"
          }`}
        >
          Calculadora de Cotizaciones
          {tabActiva === "calculadora" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-fwd" />
          )}
        </button>
        <button
          onClick={() => setTabActiva("guardadas")}
          className={`px-6 py-3 font-display text-sm font-semibold tracking-tight transition-all relative ${
            tabActiva === "guardadas"
              ? "text-fwd-morado dark:text-purple-300"
              : "text-text-muted hover:text-text"
          }`}
        >
          Mis Cotizaciones Guardadas
          {tabActiva === "guardadas" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-fwd" />
          )}
        </button>
      </div>

      {tabActiva === "calculadora" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulario de entradas */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-fwd-azul" />
                  <h2 className="font-display text-lg font-bold text-text">
                    Detalles del Proyecto Freelance
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-5">
                {/* Nombre del Proyecto */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="proj-name" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Nombre del proyecto
                  </label>
                  <input
                    id="proj-name"
                    type="text"
                    placeholder="Ej. Landing page interactiva para Veterinaria o E-commerce básico"
                    value={nombreProyecto}
                    onChange={(e) => setNombreProyecto(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[0.95rem] text-text outline-none transition placeholder:text-text-muted/50 focus:border-fwd-azul focus:bg-surface focus:ring-4 focus:ring-fwd-azul/15"
                  />
                </div>

                {/* Descripción y botón de IA */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="proj-desc" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Descripción del proyecto / requerimientos
                    </label>
                    <button
                      type="button"
                      onClick={estimarConIA}
                      disabled={cargandoIa}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-fwd-morado/10 dark:bg-purple-900/30 text-fwd-morado dark:text-purple-300 hover:bg-fwd-morado hover:text-white transition duration-200 cursor-pointer disabled:opacity-65"
                    >
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      {cargandoIa ? "Estimando..." : "Asistente IA"}
                    </button>
                  </div>
                  <textarea
                    id="proj-desc"
                    rows={4}
                    placeholder="Describe en lenguaje simple qué necesita el cliente (ej: un login de usuarios, pasarela de pagos Simple, catálogo de productos...) y nuestro asistente IA te sugerirá el desglose de funcionalidades, horas y complejidad."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[0.95rem] text-text outline-none transition placeholder:text-text-muted/50 focus:border-fwd-azul focus:bg-surface focus:ring-4 focus:ring-fwd-azul/15 resize-y"
                  />
                </div>

                {/* Tarifa Base y Moneda */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tarifa" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Tarifa base por hora
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 font-semibold text-sm">
                        {moneda === "USD" ? "$" : "₡"}
                      </span>
                      <input
                        id="tarifa"
                        type="number"
                        min="1"
                        value={tarifaBaseHora}
                        onChange={(e) => setTarifaBaseHora(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface-2 pl-8 pr-4 py-3 text-[0.95rem] text-text outline-none transition focus:border-fwd-azul focus:bg-surface focus:ring-4 focus:ring-fwd-azul/15"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="moneda" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Moneda de cotización
                    </label>
                    <select
                      id="moneda"
                      value={moneda}
                      onChange={(e) => setMoneda(e.target.value as "USD" | "CRC")}
                      className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[0.95rem] text-text outline-none transition focus:border-fwd-azul focus:bg-surface focus:ring-4 focus:ring-fwd-azul/15 cursor-pointer"
                    >
                      <option value="USD">Dólares (USD)</option>
                      <option value="CRC">Colones costarricenses (CRC)</option>
                    </select>
                  </div>
                </div>

                {/* Complejidad y Modalidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="complejidad" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Complejidad del proyecto
                    </label>
                    <select
                      id="complejidad"
                      value={complejidad}
                      onChange={(e) => setComplejidad(e.target.value as "baja" | "media" | "alta")}
                      className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[0.95rem] text-text outline-none transition focus:border-fwd-azul focus:bg-surface focus:ring-4 focus:ring-fwd-azul/15 cursor-pointer"
                    >
                      <option value="baja">Baja (Sin integraciones, estático, 1.0x)</option>
                      <option value="media">Media (Panel, Base de datos, Auth, 1.2x)</option>
                      <option value="alta">Alta (Pagos, mapas, multinivel, 1.4x)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modalidad" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Modalidad
                    </label>
                    <select
                      id="modalidad"
                      value={modalidad}
                      onChange={(e) => setModalidad(e.target.value as "remoto" | "hibrido" | "presencial")}
                      className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[0.95rem] text-text outline-none transition focus:border-fwd-azul focus:bg-surface focus:ring-4 focus:ring-fwd-azul/15 cursor-pointer"
                    >
                      <option value="remoto">Remoto (1.0x)</option>
                      <option value="hibrido">Híbrido (1.05x)</option>
                      <option value="presencial">Presencial (1.15x)</option>
                    </select>
                  </div>
                </div>

                {/* Horas Totales e IVA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="horas" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Horas totales del proyecto
                    </label>
                    <input
                      id="horas"
                      type="number"
                      min="1"
                      disabled={sincronizarHoras}
                      value={horasEstimadas}
                      onChange={(e) => setHorasEstimadas(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[0.95rem] text-text outline-none transition focus:border-fwd-azul focus:bg-surface focus:ring-4 focus:ring-fwd-azul/15 disabled:opacity-60"
                    />
                    {sincronizarHoras && (
                      <span className="text-[10px] text-fwd-morado dark:text-purple-300 font-medium">
                        Sincronizado con funcionalidades
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 select-none">
                    <input
                      id="iva-checkbox"
                      type="checkbox"
                      checked={iva}
                      onChange={(e) => setIva(e.target.checked)}
                      className="h-5 w-5 rounded-lg border-border bg-surface-2 text-fwd-azul outline-none focus:ring-2 focus:ring-fwd-azul/15 cursor-pointer"
                    />
                    <label htmlFor="iva-checkbox" className="text-sm font-semibold text-text cursor-pointer">
                      Aplicar IVA (13% Costa Rica)
                    </label>
                  </div>
                </div>

                {/* Stack Tecnológico */}
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Stack tecnológico
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TECHS_PREDEFINIDAS.map((tech) => {
                      const selected = selectedTechs.includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                            selected
                              ? "bg-fwd-azul/15 border-fwd-azul text-fwd-azul font-bold"
                              : "bg-surface-2 border-border text-text-muted hover:border-text-muted"
                          }`}
                        >
                          {tech}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Desglose de Funcionalidades */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-fwd-turquesa" />
                    <h3 className="font-display text-lg font-bold text-text">
                      Funcionalidades / Entregables
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 select-none">
                    <input
                      id="sync-hours"
                      type="checkbox"
                      checked={sincronizarHoras}
                      onChange={(e) => setSincronizarHoras(e.target.checked)}
                      className="h-4 w-4 rounded border-border bg-surface-2 text-fwd-azul cursor-pointer"
                    />
                    <label htmlFor="sync-hours" className="text-xs font-bold text-text cursor-pointer">
                      Sincronizar horas totales
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Inputs para agregar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-8 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Nombre de la funcionalidad
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Integración pasarela de pagos"
                      value={nuevaFunNombre}
                      onChange={(e) => setNuevaFunNombre(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-fwd-turquesa focus:bg-surface"
                    />
                  </div>
                  <div className="sm:col-span-3 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Horas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={nuevaFunHoras}
                      onChange={(e) => setNuevaFunHoras(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-fwd-turquesa focus:bg-surface"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={agregarFuncionalidad}
                      className="w-full h-9 flex items-center justify-center rounded-lg bg-fwd-turquesa text-white hover:bg-fwd-turquesa/90 transition duration-200 cursor-pointer"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Lista de Funcionalidades */}
                {funcionalidades.length > 0 ? (
                  <div className="rounded-xl border border-border overflow-hidden bg-surface-2">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-surface border-b border-border text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                          <th className="px-4 py-2.5">Funcionalidad</th>
                          <th className="px-4 py-2.5 w-24 text-center">Horas</th>
                          <th className="px-4 py-2.5 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {funcionalidades.map((f, i) => (
                          <tr key={i} className="hover:bg-surface/50">
                            <td className="px-4 py-2.5 text-text font-medium">{f.nombre}</td>
                            <td className="px-4 py-2.5 text-center text-text font-bold bg-surface/20">{f.horas}h</td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => eliminarFuncionalidad(i)}
                                className="text-red-500 hover:text-red-700 transition cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted text-center py-4">
                    No has agregado funcionalidades aún.
                  </p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Desglose en vivo */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            <Card variant="glass" className="overflow-hidden border-2 border-fwd-morado/25 dark:border-purple-900/35">
              <div className="bg-gradient-fwd h-1.5 w-full" />
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-fwd-morado dark:text-purple-300" />
                  <h3 className="font-display text-lg font-bold text-text">
                    Desglose de Cotización
                  </h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-4 pt-0">
                <dl className="space-y-3.5 text-sm">
                  {/* Costo Base */}
                  <div className="flex justify-between items-center">
                    <dt className="text-text-muted">
                      Costo base ({horasEstimadas}h × {fmt(tarifaBaseHora, moneda)})
                    </dt>
                    <dd className="font-bold text-text">
                      {fmt(desgloseLive.costoBase, moneda)}
                    </dd>
                  </div>

                  {/* Complejidad */}
                  <div className="flex justify-between items-center text-xs">
                    <dt className="text-text-muted flex items-center gap-1">
                      <span>Ajuste complejidad ({complejidad})</span>
                      <span className="text-[10px] font-bold text-fwd-azul">
                        {complejidad === "alta" ? "+40%" : complejidad === "media" ? "+20%" : "+0%"}
                      </span>
                    </dt>
                    <dd className="font-medium text-text">
                      +{fmt(desgloseLive.ajusteComplejidad, moneda)}
                    </dd>
                  </div>

                  {/* Modalidad */}
                  <div className="flex justify-between items-center text-xs">
                    <dt className="text-text-muted flex items-center gap-1">
                      <span>Ajuste modalidad ({modalidad})</span>
                      <span className="text-[10px] font-bold text-fwd-turquesa">
                        {modalidad === "presencial" ? "+15%" : modalidad === "hibrido" ? "+5%" : "+0%"}
                      </span>
                    </dt>
                    <dd className="font-medium text-text">
                      +{fmt(desgloseLive.ajusteModalidad, moneda)}
                    </dd>
                  </div>

                  {/* Stack */}
                  <div className="flex justify-between items-center text-xs">
                    <dt className="text-text-muted flex items-center gap-1">
                      <span>Complejidad de Stack ({selectedTechs.length} tech)</span>
                      <span className="text-[10px] font-bold text-fwd-magenta">
                        +{Math.round((Math.min(1.0 + selectedTechs.length * 0.02, 1.15) - 1) * 100)}%
                      </span>
                    </dt>
                    <dd className="font-medium text-text">
                      +{fmt(desgloseLive.ajusteStack, moneda)}
                    </dd>
                  </div>

                  <hr className="border-border" />

                  {/* Subtotal */}
                  <div className="flex justify-between items-center font-semibold text-text">
                    <dt>Subtotal</dt>
                    <dd>{fmt(desgloseLive.subtotal, moneda)}</dd>
                  </div>

                  {/* IVA */}
                  {iva && (
                    <div className="flex justify-between items-center text-xs text-text-muted">
                      <dt>IVA (13% Costa Rica)</dt>
                      <dd>+{fmt(desgloseLive.montoIva, moneda)}</dd>
                    </div>
                  )}

                  <hr className="border-border border-dashed" />

                  {/* Rango Estimado Principal */}
                  <div className="bg-surface-2 dark:bg-white/5 rounded-xl p-4 space-y-2 border border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
                        Total Estimado
                      </span>
                      <span className="text-xl font-display font-extrabold text-fwd-morado dark:text-purple-300">
                        {fmt(desgloseLive.totalEstimado, moneda)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-border pt-2 text-text-muted">
                      <span>Equivalente</span>
                      <span className="font-semibold text-text">
                        {fmt(desgloseLive.totalEstimadoAlternativo, moneda === "USD" ? "CRC" : "USD")}
                      </span>
                    </div>
                  </div>

                  {/* Rangos Mínimo y Máximo */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
                      <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        Mínimo (-15%)
                      </span>
                      <span className="block text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                        {fmt(desgloseLive.rangoMin, moneda)}
                      </span>
                      <span className="block text-[10px] text-text-muted">
                        {fmt(desgloseLive.rangoMinAlternativo, moneda === "USD" ? "CRC" : "USD")}
                      </span>
                    </div>
                    <div className="bg-red-500/5 dark:bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
                      <span className="block text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                        Máximo (+20%)
                      </span>
                      <span className="block text-sm font-bold text-red-700 dark:text-red-300 mt-0.5">
                        {fmt(desgloseLive.rangoMax, moneda)}
                      </span>
                      <span className="block text-[10px] text-text-muted">
                        {fmt(desgloseLive.rangoMaxAlternativo, moneda === "USD" ? "CRC" : "USD")}
                      </span>
                    </div>
                  </div>
                </dl>
              </CardBody>
            </Card>

            {/* Justificación IA si existe */}
            {explicacionIa && (
              <Card className="border border-fwd-morado/20 bg-fwd-morado/5">
                <CardBody className="p-4 space-y-2">
                  <h4 className="font-display text-sm font-bold text-fwd-morado dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    Análisis del Asistente IA
                  </h4>
                  <p className="text-xs text-text leading-relaxed">
                    {explicacionIa}
                  </p>
                  {rangoReferenciaIa && (
                    <div className="pt-1.5 border-t border-fwd-morado/10 text-[10px] font-semibold text-text-muted flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      <span>Referencia: {rangoReferenciaIa}</span>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Guardar y Vincular */}
            <Card>
              <CardBody className="space-y-4">
                {/* Vincular a dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="vinculo" className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Vincular cotización a un proyecto/vacante activo
                  </label>
                  <select
                    id="vinculo"
                    value={vinculo}
                    onChange={(e) => setVinculo(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-xs text-text outline-none focus:border-fwd-morado"
                  >
                    <option value="">No vincular (Cotización libre)</option>
                    
                    {ofertas.length > 0 && (
                      <optgroup label="Mis propuestas a Proyectos">
                        {ofertas.map((o) => (
                          <option key={o.id} value={`proyecto_${o.proyecto.id}`}>
                            Proyecto: {o.proyecto.titulo}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {postulaciones.length > 0 && (
                      <optgroup label="Mis postulaciones a Vacantes">
                        {postulaciones.map((p) => (
                          <option key={p.id} value={`postulacion_${p.id}`}>
                            Vacante: {p.vacante.titulo}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <Button
                  variant="primary"
                  onClick={guardarCotizacion}
                  loading={guardando}
                  fullWidth
                >
                  Guardar Cotización
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : (
        /* Pestaña: Mis Cotizaciones Guardadas */
        <div className="space-y-6">
          {cargandoGuardadas ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-fwd-morado border-t-transparent" />
              <p className="text-sm text-text-muted">Cargando tus cotizaciones...</p>
            </div>
          ) : cotizacionesGuardadas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cotizacionesGuardadas.map((c) => {
                const des = c.desglose;
                const expandida = cotizacionExpandida === c.id;
                return (
                  <Card
                    key={c.id}
                    className="flex flex-col justify-between overflow-hidden border border-border relative"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-display font-bold text-text truncate max-w-[200px]" title={c.nombre_proyecto}>
                            {c.nombre_proyecto}
                          </h4>
                          <span className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(c.creado).toLocaleDateString("es-CR")}
                          </span>
                        </div>
                        <button
                          onClick={() => borrarCotizacion(c.id, c.nombre_proyecto)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                          title="Eliminar cotización"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0 pb-4 space-y-3 flex-1">
                      {/* Badges de Complejidad y Modalidad */}
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={c.complejidad === "alta" ? "danger" : c.complejidad === "media" ? "warning" : "info"}>
                          Complejidad {c.complejidad}
                        </Badge>
                        <Badge variant="accent">
                          {c.modalidad}
                        </Badge>
                      </div>

                      {/* Vínculo si existe */}
                      {c.proyectos && (
                        <div className="flex items-center gap-1.5 text-xs text-fwd-morado dark:text-purple-300 font-bold bg-fwd-morado/5 p-2 rounded-lg">
                          <Briefcase className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Proyecto: {c.proyectos.titulo}</span>
                        </div>
                      )}
                      {c.postulaciones && (
                        <div className="flex items-center gap-1.5 text-xs text-fwd-azul font-bold bg-fwd-azul/5 p-2 rounded-lg">
                          <Briefcase className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Vacante: {c.postulaciones.vacantes?.titulo}</span>
                        </div>
                      )}

                      {/* Rango Estimado */}
                      <div className="bg-surface-2 dark:bg-white/5 rounded-xl p-3 border border-border text-center">
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wide">
                          Rango Estimado
                        </span>
                        <span className="block text-base font-display font-extrabold text-fwd-morado dark:text-purple-300 mt-0.5">
                          {fmt(c.rango_estimado, c.moneda)}
                        </span>
                        <span className="block text-[10px] text-text-muted">
                          Rango: {fmt(c.rango_min, c.moneda)} – {fmt(c.rango_max, c.moneda)}
                        </span>
                      </div>

                      {/* Acordeón de detalles */}
                      {expandida && des && (
                        <div className="text-xs space-y-2 border-t border-border pt-3 mt-3 animate-fade-in">
                          <div className="flex justify-between">
                            <span className="text-text-muted">Horas estimadas:</span>
                            <span className="font-bold text-text">{c.horas_estimadas}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Tarifa por hora:</span>
                            <span className="font-bold text-text">{fmt(c.tarifa_base_hora, c.moneda)}/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Costo base:</span>
                            <span className="font-medium text-text">{fmt(des.costoBase, c.moneda)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Ajuste complejidad:</span>
                            <span className="font-medium text-text">+{fmt(des.ajusteComplejidad, c.moneda)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Ajuste modalidad:</span>
                            <span className="font-medium text-text">+{fmt(des.ajusteModalidad, c.moneda)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-muted">Ajuste stack:</span>
                            <span className="font-medium text-text">+{fmt(des.ajusteStack, c.moneda)}</span>
                          </div>
                          {c.iva && (
                            <div className="flex justify-between">
                              <span className="text-text-muted">IVA (13%):</span>
                              <span className="font-medium text-text">+{fmt(des.montoIva, c.moneda)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-border pt-1.5 text-text-muted">
                            <span>Equivalente:</span>
                            <span className="font-semibold text-text">
                              {fmt(des.totalEstimadoAlternativo, c.moneda === "USD" ? "CRC" : "USD")}
                            </span>
                          </div>
                          {c.stack.length > 0 && (
                            <div className="flex flex-col gap-1 pt-1.5">
                              <span className="text-text-muted">Stack:</span>
                              <div className="flex flex-wrap gap-1">
                                {c.stack.map((t: string) => (
                                  <span key={t} className="px-1.5 py-0.5 rounded bg-surface border border-border text-[9px] font-medium text-text">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardBody>
                    <CardFooter className="pt-2">
                      <button
                        onClick={() => setCotizacionExpandida(expandida ? null : c.id)}
                        className="w-full text-center text-xs font-bold text-fwd-azul hover:text-fwd-azul/80 flex items-center justify-center gap-1 py-1.5 transition cursor-pointer"
                      >
                        {expandida ? (
                          <>
                            <span>Ocultar desglose</span>
                            <ChevronUp className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Ver desglose completo</span>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Calculator className="h-8 w-8" />}
              title="No hay cotizaciones guardadas"
              description="Aún no has guardado ninguna cotización. Abre la calculadora, ingresa los datos de tu proyecto freelance y haz clic en Guardar Cotización."
              action={
                <Button onClick={() => setTabActiva("calculadora")} variant="primary">
                  Ir a la Calculadora
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
