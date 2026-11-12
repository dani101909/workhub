"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ENLACES_CANDIDATO = [
  { href: "/vacantes", etiqueta: "Vacantes", icono: "💼" },
  { href: "/empresas", etiqueta: "Empresas", icono: "🏢" },
  { href: "/aplicaciones", etiqueta: "Aplicaciones", icono: "📋" },
  { href: "/perfil", etiqueta: "Mi Perfil", icono: "👤" },
];

// insignias: { "/aplicaciones": 3 } muestra un número azul junto al enlace
export default function Sidebar({
  nombre,
  iniciales,
  enlaces = ENLACES_CANDIDATO,
  subtitulo = "Bolsa de Trabajo",
  perfilHref = "/perfil",
  insignias = {},
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [errorCierre, setErrorCierre] = useState("");

  function pedirConfirmacion() {
    setAbierto(false);
    setErrorCierre("");
    setConfirmando(true);
  }

  async function cerrarSesion() {
    setCerrando(true);
    setErrorCierre("");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setErrorCierre("No se pudo cerrar la sesión. Intenta de nuevo.");
      setCerrando(false);
    }
  }

  const marca = (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b6ef5] text-xl">
        💼
      </div>
      <div>
        <p className="font-[family-name:var(--font-outfit)] text-base font-bold leading-none text-white">
          WorkHub
        </p>
        <p className="mt-1 text-[11px] text-slate-400">{subtitulo}</p>
      </div>
    </div>
  );

  // El mismo contenido se usa en el menú de escritorio y en el de celular
  const contenido = (
    <>
      <div className="border-b border-white/10 px-5 py-5">{marca}</div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Principal
        </p>
        <ul className="space-y-1">
          {enlaces.map((enlace) => {
            const activo = pathname.startsWith(enlace.href);
            const cantidad = insignias[enlace.href];
            return (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  onClick={() => setAbierto(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    activo
                      ? "bg-[#3b6ef5] text-white"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span>{enlace.icono}</span>
                  {enlace.etiqueta}
                  {cantidad > 0 && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        activo ? "bg-white text-[#3b6ef5]" : "bg-[#3b6ef5] text-white"
                      }`}
                    >
                      {cantidad}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={pedirConfirmacion}
          className="w-full rounded-lg bg-red-500/10 px-3 py-2.5 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/20"
        >
          ⏻ Cerrar sesión
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5b8cff] to-[#a855f7] text-xs font-bold text-white">
          {iniciales}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{nombre}</p>
          <Link
            href={perfilHref}
            onClick={() => setAbierto(false)}
            className="text-[11px] text-slate-400 hover:text-slate-200"
          >
            Ver perfil →
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Celular y tableta: barra superior con botón de menú */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#0f1b33] px-4 py-3 lg:hidden">
        {marca}
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          className="rounded-lg bg-white/10 px-3 py-2 text-lg leading-none text-white"
        >
          ☰
        </button>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAbierto(false)}
          />
          <aside className="relative flex h-full w-[260px] max-w-[85%] flex-col bg-[#0f1b33] text-slate-300 shadow-2xl">
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-4 rounded-lg px-2 py-1 text-lg leading-none text-slate-400 hover:text-white"
            >
              ✕
            </button>
            {contenido}
          </aside>
        </div>
      )}

      {confirmando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-cerrar-sesion"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !cerrando && setConfirmando(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2
              id="titulo-cerrar-sesion"
              className="font-[family-name:var(--font-outfit)] text-lg font-bold text-slate-900"
            >
              ¿Cerrar sesión?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tendrás que iniciar sesión de nuevo para volver a entrar.
            </p>
            {errorCierre && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorCierre}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmando(false)}
                disabled={cerrando}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={cerrarSesion}
                disabled={cerrando}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {cerrando ? "Cerrando..." : "Sí, cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escritorio: menú fijo a la izquierda */}
      <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col bg-[#0f1b33] text-slate-300 lg:flex">
        {contenido}
      </aside>
    </>
  );
}
