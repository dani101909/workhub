import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import User from "@/models/User";
import Application from "@/models/Application";
import "@/models/Job";
import "@/models/Company";
import ProfileForm from "@/components/ProfileForm";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatearFecha(fecha) {
  const d = new Date(fecha);
  return `${d.getDate()} ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

// Cada dato del perfil vale lo mismo: 9 en total
function calcularCompletitud(u) {
  const pasos = [
    { etiqueta: "Titular profesional", hecho: !!u.titular },
    { etiqueta: "Ubicación", hecho: !!u.ubicacion },
    { etiqueta: "Años de experiencia", hecho: u.aniosExperiencia != null },
    { etiqueta: "LinkedIn", hecho: !!u.linkedin },
    { etiqueta: "Sobre mí", hecho: !!u.sobreMi },
    { etiqueta: "Habilidades", hecho: (u.habilidades?.length ?? 0) > 0 },
    { etiqueta: "Experiencia laboral", hecho: (u.experiencia?.length ?? 0) > 0 },
    { etiqueta: "Certificaciones", hecho: (u.certificaciones?.length ?? 0) > 0 },
    { etiqueta: "CV", hecho: !!u.cvUrl },
  ];
  const porcentaje = Math.round((pasos.filter((p) => p.hecho).length / pasos.length) * 100);
  return { pasos, porcentaje };
}

export default async function PerfilPage() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  await connectDB();

  const usuario = await User.findById(sesion.id).select("-password").lean();
  if (!usuario) redirect("/login");

  const recientes = await Application.find({ usuario: sesion.id })
    .populate({
      path: "vacante",
      select: "titulo empresa",
      populate: { path: "empresa", select: "nombre" },
    })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const { pasos, porcentaje } = calcularCompletitud(usuario);

  // Solo datos simples (sin ObjectId ni Date) para pasarlos al componente cliente
  const inicial = {
    nombre: usuario.nombre,
    email: usuario.email,
    titular: usuario.titular ?? "",
    ubicacion: usuario.ubicacion ?? "",
    aniosExperiencia: usuario.aniosExperiencia ?? "",
    linkedin: usuario.linkedin ?? "",
    sobreMi: usuario.sobreMi ?? "",
    cvUrl: usuario.cvUrl ?? "",
    habilidades: usuario.habilidades ?? [],
    experiencia: (usuario.experiencia ?? []).map((e) => ({
      puesto: e.puesto ?? "",
      empresa: e.empresa ?? "",
      desde: e.desde ?? "",
      hasta: e.hasta ?? "",
      descripcion: e.descripcion ?? "",
    })),
    certificaciones: (usuario.certificaciones ?? []).map((c) => ({
      nombre: c.nombre ?? "",
      emisor: c.emisor ?? "",
      anio: c.anio ?? "",
    })),
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
        Mi perfil
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Mantén tu información actualizada para destacar ante las empresas
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ProfileForm usuario={inicial} />

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Perfil completo</h2>
              <span className="font-[family-name:var(--font-outfit)] text-xl font-bold text-[#3b6ef5]">
                {porcentaje}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#3b6ef5] transition-all"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <ul className="mt-4 space-y-1.5 text-xs">
              {pasos.map((p) => (
                <li
                  key={p.etiqueta}
                  className={p.hecho ? "text-emerald-600" : "text-slate-400"}
                >
                  {p.hecho ? "✓" : "○"} {p.etiqueta}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Actividad reciente</h2>
            {recientes.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">Aún no tienes actividad.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {recientes.map((a) => (
                  <li key={String(a._id)} className="text-xs text-slate-600">
                    Aplicaste a{" "}
                    <span className="font-semibold text-slate-900">
                      {a.vacante?.titulo ?? "una vacante"}
                    </span>
                    {a.vacante?.empresa?.nombre ? ` en ${a.vacante.empresa.nombre}` : ""}
                    <span className="block text-slate-400">
                      {formatearFecha(a.createdAt)} · {a.estado}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
