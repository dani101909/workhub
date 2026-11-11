"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VacanteAcciones({ vacanteId, activa }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function alternar() {
    setError("");
    setCargando(true);
    try {
      const res = await fetch(`/api/empresa/jobs/${vacanteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !activa }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "No se pudo actualizar");
        return;
      }
      router.refresh();
    } catch {
      setError("Sin conexión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex items-center gap-3 text-xs font-semibold">
      <Link href={`/empresa/vacantes/${vacanteId}/editar`} className="text-[#3b6ef5] hover:underline">
        Editar
      </Link>
      <button type="button" onClick={alternar} disabled={cargando} className={`hover:underline disabled:opacity-60 ${activa ? "text-red-500" : "text-emerald-600"}`}>
        {cargando ? "..." : activa ? "Cerrar" : "Reabrir"}
      </button>
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
