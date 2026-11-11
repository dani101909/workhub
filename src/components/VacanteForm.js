"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MODALIDADES, CATEGORIAS, TIPOS } from "@/lib/constantes";

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

// vacante = null para crear; con datos para editar
export default function VacanteForm({ vacante = null, ubicacionInicial = "" }) {
  const router = useRouter();
  const editando = !!vacante;
  const [datos, setDatos] = useState({
    titulo: vacante?.titulo ?? "",
    descripcion: vacante?.descripcion ?? "",
    ubicacion: vacante?.ubicacion ?? ubicacionInicial,
    modalidad: vacante?.modalidad ?? "Presencial",
    tipo: vacante?.tipo ?? "Tiempo completo",
    categoria: vacante?.categoria ?? "Tecnología",
    salarioMin: vacante?.salarioMin ?? "",
    salarioMax: vacante?.salarioMax ?? "",
    habilidades: (vacante?.habilidades ?? []).join(", "),
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function cambiar(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const url = editando ? `/api/empresa/jobs/${vacante.id}` : "/api/empresa/jobs";
      const res = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar la vacante");
        return;
      }
      router.push("/empresa/vacantes");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Campo etiqueta="Título del puesto">
        <input className={input} required maxLength={120} value={datos.titulo} placeholder="Ej. Desarrollador Full Stack" onChange={(e) => cambiar("titulo", e.target.value)} />
      </Campo>

      <Campo etiqueta="Descripción">
        <textarea className={input} required rows={4} maxLength={1000} value={datos.descripcion} placeholder="Describe las responsabilidades y requisitos" onChange={(e) => cambiar("descripcion", e.target.value)} />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Ubicación">
          <input className={input} required value={datos.ubicacion} placeholder="Ej. Monterrey, N.L." onChange={(e) => cambiar("ubicacion", e.target.value)} />
        </Campo>
        <Campo etiqueta="Modalidad">
          <select className={input} value={datos.modalidad} onChange={(e) => cambiar("modalidad", e.target.value)}>
            {MODALIDADES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Tipo de contrato">
          <select className={input} value={datos.tipo} onChange={(e) => cambiar("tipo", e.target.value)}>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Categoría">
          <select className={input} value={datos.categoria} onChange={(e) => cambiar("categoria", e.target.value)}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Salario mínimo (MXN, opcional)">
          <input className={input} type="number" min="0" value={datos.salarioMin} onChange={(e) => cambiar("salarioMin", e.target.value)} />
        </Campo>
        <Campo etiqueta="Salario máximo (MXN, opcional)">
          <input className={input} type="number" min="0" value={datos.salarioMax} onChange={(e) => cambiar("salarioMax", e.target.value)} />
        </Campo>
      </div>

      <Campo etiqueta="Habilidades requeridas (separadas por comas)">
        <input className={input} value={datos.habilidades} placeholder="React, Node.js, MongoDB" onChange={(e) => cambiar("habilidades", e.target.value)} />
      </Campo>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={guardando} className="rounded-lg bg-[#3b6ef5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f5fe0] disabled:opacity-60">
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Publicar vacante"}
        </button>
        <button type="button" onClick={() => router.push("/empresa/vacantes")} disabled={guardando} className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}
