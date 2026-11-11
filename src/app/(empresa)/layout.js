import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import User from "@/models/User";
import Company from "@/models/Company";
import Sidebar from "@/components/Sidebar";

const ENLACES_EMPRESA = [
  { href: "/empresa/vacantes", etiqueta: "Mis vacantes", icono: "💼" },
  { href: "/empresa/candidatos", etiqueta: "Candidatos", icono: "👥" },
  { href: "/empresa/perfil", etiqueta: "Perfil de empresa", icono: "🏢" },
];

function obtenerIniciales(nombre) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

export default async function EmpresaLayout({ children }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  await connectDB();
  const usuario = await User.findById(sesion.id).select("nombre rol empresa").lean();
  if (!usuario) redirect("/login");

  // Los candidatos no pueden entrar al panel de empresa
  if (usuario.rol !== "empresa") redirect("/vacantes");

  const empresa = usuario.empresa
    ? await Company.findById(usuario.empresa).select("nombre").lean()
    : null;

  return (
    <div className="flex min-h-screen bg-[#f1f4f9] text-slate-900">
      <Sidebar
        nombre={usuario.nombre}
        iniciales={obtenerIniciales(usuario.nombre)}
        enlaces={ENLACES_EMPRESA}
        subtitulo="Panel de empresa"
        perfilHref="/empresa/perfil"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3">
          <p className="text-sm font-semibold text-slate-700">
            {empresa?.nombre ?? "Tu empresa"}
          </p>
          <Link
            href="/empresa/vacantes/nueva"
            className="rounded-lg bg-[#3b6ef5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f5fe0]"
          >
            + Nueva vacante
          </Link>
        </header>
        <main className="flex-1 p-8">
          {empresa ? (
            children
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              Tu cuenta no tiene una empresa asociada. Crea una cuenta nueva
              como empresa.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
