import Link from "next/link";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import Application from "@/models/Application";
import Job from "@/models/Job";
import Company from "@/models/Company";
import { iniciales, colorAvatar } from "@/lib/formato";
import { COLORES_ESTADO } from "@/lib/constantes";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const PASOS = ["En revisión", "Entrevista", "Oferta"];

function formatearFecha(fecha) {
  const d = new Date(fecha);
  return `${d.getDate()} ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatearSalario(min, max) {
  if (min == null && max == null) return "No especificado";
  const f = (n) => `$${Number(n).toLocaleString("en-US")}`;
  if (min != null && max != null) return `${f(min)} – ${f(max)} MXN`;
  return `${f(min ?? max)} MXN`;
}

export default async function DetalleAplicacionPage({ params }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();

  // Solo se puede ver una aplicación propia
  const aplicacion = await Application.findOne({ _id: id, usuario: sesion.id })
    .populate({
      path: "vacante",
      model: Job,
      populate: { path: "empresa", model: Company, select: "nombre sector ubicacion" },
    })
    .lean();
  if (!aplicacion) notFound();

  const v = aplicacion.vacante;
  const empresa = v?.empresa?.nombre ?? "Empresa";
  const rechazada = aplicacion.estado === "Rechazado";
  const indice = PASOS.indexOf(aplicacion.estado);

  return (
    <div className="max-w-4xl">
      <Link href="/aplicaciones" className="text-sm font-semibold text-[#3b6ef5] hover:underline">
        ← Volver a mis aplicaciones
      </Link>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-base font-bold ${colorAvatar(empresa)}`}>
            {iniciales(empresa)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-slate-900">
              {v?.titulo ?? "Vacante eliminada"}
            </h1>
            <p className="text-sm text-slate-500">
              {empresa}
              {v?.ubicacion ? ` · ${v.ubicacion}` : ""}
            </p>
          </div>
          <span className={`rounded px-2 py-1 text-[11px] font-semibold uppercase ${COLORES_ESTADO[aplicacion.estado] ?? "bg-slate-100 text-slate-600"}`}>
            {aplicacion.estado}
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Seguimiento</h2>

        {rechazada ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            Tu proceso para esta vacante se cerró. ¡Sigue aplicando, hay más oportunidades!
          </p>
        ) : (
          <ol className="flex items-center">
            {PASOS.map((paso, i) => {
              const hecho = i <= indice;
              return (
                <li key={paso} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${hecho ? "bg-[#3b6ef5] text-white" : "bg-slate-100 text-slate-400"}`}>
                      {hecho ? "✓" : i + 1}
                    </span>
                    <span className={`text-center text-[11px] font-semibold ${hecho ? "text-slate-900" : "text-slate-400"}`}>
                      {paso}
                    </span>
                  </div>
                  {i < PASOS.length - 1 && (
                    <span className={`mx-2 mb-5 h-0.5 flex-1 ${i < indice ? "bg-[#3b6ef5]" : "bg-slate-200"}`} />
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Etapa actual</dt>
            <dd className="text-slate-800">{aplicacion.etapa}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fecha de aplicación</dt>
            <dd className="text-slate-800">{formatearFecha(aplicacion.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Última actualización</dt>
            <dd className="text-slate-800">{formatearFecha(aplicacion.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      {v && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Sobre la vacante</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{v.descripcion}</p>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Modalidad</dt>
              <dd className="text-slate-800">{v.modalidad}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo de contrato</dt>
              <dd className="text-slate-800">{v.tipo}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Salario</dt>
              <dd className="text-slate-800">{formatearSalario(v.salarioMin, v.salarioMax)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Categoría</dt>
              <dd className="text-slate-800">{v.categoria}</dd>
            </div>
          </dl>

          {v.habilidades?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {v.habilidades.map((h) => (
                <span key={h} className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-500">{h}</span>
              ))}
            </div>
          )}

          {!v.activa && (
            <p className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-xs text-slate-600">
              Esta vacante ya está cerrada por la empresa.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
