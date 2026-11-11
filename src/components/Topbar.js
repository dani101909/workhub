"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const pestanas = [
  { href: "/vacantes", etiqueta: "Vacantes", icono: "💼" },
  { href: "/empresas", etiqueta: "Empresas", icono: "🏢" },
  { href: "/aplicaciones", etiqueta: "Aplicaciones", icono: "📋" },
];

function Buscador() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qActual = searchParams.get("q") ?? "";

  function buscar(e) {
    e.preventDefault();
    const valor = new FormData(e.currentTarget).get("q")?.toString().trim();
    router.push(
      valor ? `/vacantes?q=${encodeURIComponent(valor)}` : "/vacantes"
    );
  }

  return (
    <form onSubmit={buscar} className="relative w-full max-w-[520px]">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
        🔍
      </span>
      <input
        key={qActual}
        name="q"
        defaultValue={qActual}
        placeholder="Buscar vacantes, empresas, habilidades..."
        className="w-full rounded-lg border border-slate-200 bg-[#f4f6fa] py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#3b6ef5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b6ef5]/20"
      />
    </form>
  );
}

export default function Topbar() {
  const pathname = usePathname();

  return (
    <header className="flex items-center gap-6 border-b border-slate-200 bg-white px-8 py-3">
      <Suspense fallback={<div className="h-10 w-full max-w-[520px]" />}>
        <Buscador />
      </Suspense>

      <nav className="flex items-center gap-1">
        {pestanas.map((pestana) => {
          const activa = pathname.startsWith(pestana.href);
          return (
            <Link
              key={pestana.href}
              href={pestana.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                activa
                  ? "bg-blue-50 text-[#3b6ef5]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{pestana.icono}</span>
              {pestana.etiqueta}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="ml-auto rounded-lg bg-[#3b6ef5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f5fe0]"
      >
        + Subir CV
      </button>
    </header>
  );
}