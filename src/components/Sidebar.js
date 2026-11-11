"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ENLACES_CANDIDATO = [
  { href: "/vacantes", etiqueta: "Vacantes", icono: "💼" },
  { href: "/empresas", etiqueta: "Empresas", icono: "🏢" },
  { href: "/aplicaciones", etiqueta: "Aplicaciones", icono: "📋" },
  { href: "/perfil", etiqueta: "Mi Perfil", icono: "👤" },
];

export default function Sidebar({
  nombre,
  iniciales,
  enlaces = ENLACES_CANDIDATO,
  subtitulo = "Bolsa de Trabajo",
  perfilHref = "/perfil",
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col bg-[#0f1b33] text-slate-300">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
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

      <nav className="flex-1 px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Principal
        </p>
        <ul className="space-y-1">
          {enlaces.map((enlace) => {
            const activo = pathname.startsWith(enlace.href);
            return (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    activo
                      ? "bg-[#3b6ef5] text-white"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span>{enlace.icono}</span>
                  {enlace.etiqueta}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={cerrarSesion}
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
            className="text-[11px] text-slate-400 hover:text-slate-200"
          >
            Ver perfil →
          </Link>
        </div>
      </div>
    </aside>
  );
}