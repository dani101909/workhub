"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS, COLORES_ESTADO } from "@/lib/constantes";

export default function EstadoSelect({ aplicacionId, estadoInicial }) {
  const router = useRouter();
  const [estado, setEstado] = useState(estadoInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function cambiar(e) {
    const nuevo = e.target.value;
    const anterior = estado;
    setEstado(nuevo);
    setError("");
    setCargando(true);
    try {
      const res = await fetch(`/api/empresa/applications/${aplicacionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevo }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEstado(anterior);
        setError(data.error || "No se pudo cambiar");
        return;
      }
      router.refresh();
    } catch {
      setEstado(anterior);
      setError("Sin conexión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <select
        value={estado}
        onChange={cambiar}
        disabled={cargando}
        className={`rounded px-2 py-1 text-[11px] font-semibold uppercase focus:outline-none disabled:opacity-60 ${COLORES_ESTADO[estado] ?? "bg-slate-100 text-slate-600"}`}
      >
        {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
