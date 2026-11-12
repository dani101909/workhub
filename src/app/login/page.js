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
          <div className="mb-10 flex items-center gap-3 sm:mb-16">
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

          <h1 className="font-[family-name:var(--font-outfit)] text-4xl font-bold leading-tight text-white sm:text-5xl">
            Tu próxima{" "}
            <span className="bg-gradient-to-r from-[#5b8cff] to-[#a855f7] bg-clip-text text-transparent">
              oportunidad
            </span>{" "}
            te espera.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-400">
            Busca vacantes, aplica con un clic y da seguimiento a tus
            postulaciones. Si eres empresa, publica tus vacantes y administra a
            tus candidatos en un solo lugar.
          </p>

          <div className="mt-12 flex flex-wrap gap-8">
            <div>
              <p className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white">
                1 clic
              </p>
              <p className="text-xs text-slate-400">Para aplicar a una vacante</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white">
                2 paneles
              </p>
              <p className="text-xs text-slate-400">Candidato y empresa</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white">
                Seguro
              </p>
              <p className="text-xs text-slate-400">Contraseñas cifradas</p>
            </div>
          </div>
        </section>

        <AuthCard />
      </div>
    </main>
  );
}