import Link from "next/link";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerContextoEmpresa } from "@/lib/empresa";
import Job from "@/models/Job";
import Application from "@/models/Application";
import User from "@/models/User";
import EstadoSelect from "@/components/EstadoSelect";
import { iniciales, colorAvatar } from "@/lib/formato";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
function formatearFecha(fecha) {
  const d = new Date(fecha);
  return `${d.getDate()} ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

export default async function CandidatosPage({ searchParams }) {
  const ctx = await obtenerContextoEmpresa();
  if (!ctx) redirect("/login");

  const parametros = await searchParams;
  const pedida = Array.isArray(parametros.vacante) ? parametros.vacante[0] : parametros.vacante;

  await connectDB();

  const vacantes = await Job.find({ empresa: ctx.empresaId })
    .select("titulo")
    .sort({ createdAt: -1 })
    .lean();
  const idsPropios = vacantes.map((v) => String(v._id));

  // Solo se filtra por una vacante si de verdad es de esta empresa
  const filtroVacante =
    pedida && mongoose.isValidObjectId(pedida) && idsPropios.includes(pedida)
      ? pedida
      : null;

  const aplicaciones = await Application.find({
    vacante: filtroVacante ? filtroVacante : { $in: idsPropios },
  })
    .populate({ path: "usuario", model: User, select: "nombre titular ubicacion" })
    .populate({ path: "vacante", model: Job, select: "titulo" })
    .sort({ createdAt: -1 })
    .lean();

  const total = aplicaciones.length;
  const enRevision = aplicaciones.filter((a) => a.estado === "En revisión").length;
  const entrevistas = aplicaciones.filter((a) => a.estado === "Entrevista").length;
  const ofertas = aplicaciones.filter((a) => a.estado === "Oferta").length;

  const tarjetas = [
    { etiqueta: "Total", valor: total, caja: "border-blue-100 bg-blue-50", numero: "text-[#3b6ef5]" },
    { etiqueta: "En revisión", valor: enRevision, caja: "border-amber-100 bg-amber-50", numero: "text-amber-500" },
    { etiqueta: "Entrevistas", valor: entrevistas, caja: "border-blue-100 bg-blue-50", numero: "text-[#3b6ef5]" },
    { etiqueta: "Ofertas", valor: ofertas, caja: "border-emerald-100 bg-emerald-50", numero: "text-emerald-500" },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
        Candidatos
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Personas que aplicaron a tus vacantes
      </p>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div key={t.etiqueta} className={`rounded-2xl border p-6 ${t.caja}`}>
            <p className={`font-[family-name:var(--font-outfit)] text-3xl font-bold ${t.numero}`}>{t.valor}</p>
            <p className="mt-1 text-sm text-slate-600">{t.etiqueta}</p>
          </div>
        ))}
      </div>

      {vacantes.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/empresa/candidatos"
            className={`rounded-lg border bg-white px-4 py-1.5 text-sm font-medium ${!filtroVacante ? "border-[#3b6ef5] text-[#3b6ef5]" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}
          >
            Todas las vacantes
          </Link>
          {vacantes.map((v) => (
            <Link
              key={String(v._id)}
              href={`/empresa/candidatos?vacante=${String(v._id)}`}
              className={`rounded-lg border bg-white px-4 py-1.5 text-sm font-medium ${filtroVacante === String(v._id) ? "border-[#3b6ef5] text-[#3b6ef5]" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}
            >
              {v.titulo}
            </Link>
          ))}
        </div>
      )}

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Todavía no hay candidatos para mostrar.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Candidato</th>
                <th className="px-6 py-4">Puesto</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {aplicaciones.map((a) => {
                const id = String(a._id);
                const nombre = a.usuario?.nombre ?? "Usuario eliminado";
                return (
                  <tr key={id} className="border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${colorAvatar(nombre)}`}>
                          {iniciales(nombre)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{nombre}</p>
                          <p className="text-xs text-slate-500">{a.usuario?.titular || "Sin titular"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{a.vacante?.titulo ?? "Vacante eliminada"}</td>
                    <td className="px-6 py-4 text-slate-500">{formatearFecha(a.createdAt)}</td>
                    <td className="px-6 py-4">
                      <EstadoSelect aplicacionId={id} estadoInicial={a.estado} />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/empresa/candidatos/${id}`} className="text-xs font-semibold text-[#3b6ef5] hover:underline">
                        Ver perfil →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
