import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  /** Callback with the selected filter values */
  onChange: (filters: Record<string, string>) => void;
}

/**
 * Simple multiselect filter bar. The UI is lightweight (no external library) to keep the bundle small.
 * Each filter is rendered as a button that opens a dropdown with options. Selected values are shown
 * as tags that can be removed.
 */
export default function FilterBar({ onChange }: FilterBarProps) {
  const filterConfig: Record<string, FilterOption[]> = {
    year: [
      { label: "2023", value: "2023" },
      { label: "2024", value: "2024" },
      { label: "2025", value: "2025" },
    ],
    country: [
      { label: "Costa Rica", value: "CR" },
      { label: "Panamá", value: "PA" },
      { label: "Guatemala", value: "GT" },
    ],
    industry: [
      { label: "Todas", value: "all" },
      { label: "Tecnología", value: "tech" },
      { label: "Finanzas", value: "finance" },
      { label: "Educación", value: "education" },
      { label: "Salud", value: "health" },
    ],
    target: [
      { label: "Todos", value: "all" },
      { label: "Prospectos", value: "prospects" },
      { label: "Clientes", value: "clients" },
      { label: "Emprendedores", value: "entrepreneurs" },
    ],
    segment: [
      { label: "Estudiantes", value: "students" },
      { label: "Startups", value: "startups" },
      { label: "Pymes", value: "smes" },
      { label: "Corporaciones", value: "corporates" },
    ],
  };

  const [open, setOpen] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const toggleDropdown = (key: string) => {
    setOpen(open === key ? null : key);
  };

  const handleSelect = (key: string, value: string) => {
    const newSelected = { ...selected, [key]: value };
    setSelected(newSelected);
    onChange(newSelected);
    setOpen(null);
  };

  const handleClear = (key: string) => {
    const { [key]: _, ...rest } = selected;
    setSelected(rest);
    onChange(rest);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {Object.entries(filterConfig).map(([key, options]) => (
        <div key={key} className="relative">
          {/* Tag with selected value */}
          {selected[key] && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/10 text-white">
              {options.find(o => o.value === selected[key])?.label}
              <button
                type="button"
                onClick={() => handleClear(key)}
                className="ml-1 hover:text-red-400"
              >
                ×
              </button>
            </span>
          )}
          {/* Button to open dropdown */}
          <button
            type="button"
            onClick={() => toggleDropdown(key)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-white/5 rounded border border-white/10 hover:bg-white/10"
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            <ChevronDown className="h-4 w-4" />
          </button>
          {open === key && (
            <div className="absolute z-10 w-48 mt-1 bg-white/5 backdrop-blur-xl rounded border border-white/20 shadow-lg">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(key, opt.value)}
                  className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
