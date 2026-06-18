export type ProyectoAdmin = {
  id: string;
  titulo: string;
  estado: string;
  publicado: string | Date | null;
  cierre: string | Date | null;
  motivo_estado: string | null;
  estado_previo: string | null;
  perfiles_empresario: { usuarios: { nombre: string } } | null;
  _count: { ofertas: number };
};

"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";

// ... rest of the file remains unchanged ...
