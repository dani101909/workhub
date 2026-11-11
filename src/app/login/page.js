import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import User from "@/models/User";
import AuthCard from "@/components/AuthCard";

export default async function LoginPage() {
  // Si ya hay una sesión válida, no tiene caso mostrar el login
  const sesion = await obtenerSesion();
  if (sesion) {
    await connectDB();
    const existe = await User.exists({ _id: sesion.id });
    if (existe) redirect("/vacantes");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#121f3b] via-[#1b2d54] to-[#223f73] px-6 py-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1400px] flex-col items-center justify-center gap-12 lg:flex-row lg:justify-between">
        <section className="max-w-xl">
          <div className="mb-16 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3b6ef5] text-xl">
              💼
            </div>
            <div>
              <p className="font-[family-name:var(--font-outfit)] text-xl font-bold leading-none text-white">
                WorkHub
              </p>
              <p className="mt-1 text-xs text-slate-400">Bolsa de Trabajo</p>
            </div>
          </div>

          <h1 className="font-[family-name:var(--font-outfit)] text-5xl font-bold leading-tight text-white">
            Tu próxima{" "}
            <span className="bg-gradient-to-r from-[#5b8cff] to-[#a855f7] bg-clip-text text-transparent">
              oportunidad
            </span>{" "}
            te espera.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-400">
            Miles de vacantes en las mejores empresas de México. Crea tu
            perfil, aplica en segundos y lleva tu carrera al siguiente nivel.
          </p>

          <div className="mt-12 flex gap-8">
            <div>
              <p className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white">
                8,400+
              </p>
              <p className="text-xs text-slate-400">Vacantes activas</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white">
                1,200+
              </p>
              <p className="text-xs text-slate-400">Empresas</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white">
                94%
              </p>
              <p className="text-xs text-slate-400">Tasa de colocación</p>
            </div>
          </div>
        </section>

        <AuthCard />
      </div>
    </main>
  );
}