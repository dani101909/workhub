"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#3b6ef5] focus:outline-none focus:ring-2 focus:ring-[#3b6ef5]/20";

function Campo({ etiqueta, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{etiqueta}</span>
      {children}
    </label>
  );
}

export default function CompanyForm({ empresa }) {
  const router = useRouter();
  const [datos, setDatos] = useState(empresa);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  function cambiar(campo, valor) {
    setExito(false);
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");
    setExito(false);
    setGuardando(true);
    try {
      const res = await fetch("/api/empresa/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar");
        return;
      }
      setExito(true);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre de la empresa">
          <input className={input} required value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
        </Campo>
        <Campo etiqueta="Sector">
          <input className={input} value={datos.sector} placeholder="Ej. Tecnología" onChange={(e) => cambiar("sector", e.target.value)} />
        </Campo>
        <Campo etiqueta="Ubicación">
          <input className={input} value={datos.ubicacion} placeholder="Ej. Monterrey, N.L." onChange={(e) => cambiar("ubicacion", e.target.value)} />
        </Campo>
        <Campo etiqueta="Tamaño">
          <input className={input} value={datos.tamano} placeholder="Ej. 51-200 empleados" onChange={(e) => cambiar("tamano", e.target.value)} />
        </Campo>
      </div>
      <Campo etiqueta="Descripción">
        <textarea className={input} rows={4} maxLength={1000} value={datos.descripcion} placeholder="Cuéntales a los candidatos quiénes son" onChange={(e) => cambiar("descripcion", e.target.value)} />
      </Campo>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      {exito && <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">Perfil actualizado ✓</p>}

      <button type="submit" disabled={guardando} className="rounded-lg bg-[#3b6ef5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f5fe0] disabled:opacity-60">
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
