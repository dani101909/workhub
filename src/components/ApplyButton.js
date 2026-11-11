"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyButton({ vacanteId, yaAplicada }) {
  const router = useRouter();
  const [aplicada, setAplicada] = useState(yaAplicada);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function aplicar() {
    setError("");
    setCargando(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacanteId }),
      });
      const data = await res.json();

      // 409 significa que ya había aplicado: lo tratamos como aplicada
      if (res.ok || res.status === 409) {
        setAplicada(true);
        router.refresh();
        return;
      }

      setError(data.error || "No se pudo enviar la aplicación");
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={aplicar}
        disabled={aplicada || cargando}
        className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
          aplicada
            ? "cursor-default bg-emerald-50 text-emerald-700"
            : "bg-[#3b6ef5] text-white hover:bg-[#2f5fe0] disabled:opacity-60"
        }`}
      >
        {aplicada ? "Aplicada ✓" : cargando ? "Enviando..." : "Aplicar"}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}