import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import Application from "@/models/Application";
import "@/models/Job";
import "@/models/Company";
import { iniciales, colorAvatar } from "@/lib/formato";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const COLORES_ESTADO = {
  "En revisión": "bg-amber-100 text-amber-700",
  Entrevista: "bg-blue-100 text-blue-700",
  Oferta: "bg-emerald-100 text-emerald-700",
  Rechazado: "bg-red-100 text-red-600",
};

// "4 Sep, 2026"
function formatearFecha(fecha) {
  const d = new Date(fecha);
  return `${d.getDate()} ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

export default async function AplicacionesPage() {
  const sesion = await obtenerSesion();

  await connectDB();

  const aplicaciones = await Application.find({ usuario: sesion.id })
    .populate({
      path: "vacante",
      select: "titulo empresa",
      populate: { path: "empresa", select: "nombre" },
    })
    .sort({ createdAt: -1 })
    .lean();

  const total = aplicaciones.length;
  const activas = aplicaciones.filter((a) => a.estado !== "Rechazado").length;
  const entrevistas = aplicaciones.filter((a) => a.estado === "Entrevista").length;
  const ofertas = aplicaciones.filter((a) => a.estado === "Oferta").length;

  const tarjetas = [
    { etiqueta: "Total", valor: total, caja: "border-blue-100 bg-blue-50", numero: "text-[#3b6ef5]" },
    { etiqueta: "Activas", valor: activas, caja: "border-emerald-100 bg-emerald-50", numero: "text-emerald-500" },
    { etiqueta: "Entrevistas", valor: entrevistas, caja: "border-amber-100 bg-amber-50", numero: "text-amber-500" },
    { etiqueta: "Ofertas", valor: ofertas, caja: "border-emerald-100 bg-emerald-50", numero: "text-emerald-500" },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
        Mis aplicaciones
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Seguimiento de tus postulaciones activas
      </p>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div key={t.etiqueta} className={`rounded-2xl border p-6 ${t.caja}`}>
            <p className={`font-[family-name:var(--font-outfit)] text-3xl font-bold ${t.numero}`}>
              {t.valor}
            </p>
            <p className="mt-1 text-sm text-slate-600">{t.etiqueta}</p>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Todavía no has aplicado a ninguna vacante.{" "}
          <Link href="/vacantes" className="font-semibold text-[#3b6ef5] hover:underline">
            Ver vacantes disponibles
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Puesto</th>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Etapa</th>
                <th className="px-6 py-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {aplicaciones.map((aplicacion) => {
                const puesto = aplicacion.vacante?.titulo ?? "Vacante eliminada";
                const empresa = aplicacion.vacante?.empresa?.nombre ?? "Empresa";

                return (
                  <tr
                    key={String(aplicacion._id)}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">{puesto}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${colorAvatar(
                            empresa
                          )}`}
                        >
                          {iniciales(empresa)}
                        </span>
                        <span className="text-slate-700">{empresa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatearFecha(aplicacion.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-1 text-[11px] font-semibold uppercase ${
                          COLORES_ESTADO[aplicacion.estado] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {aplicacion.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{aplicacion.etapa}</td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      <Link
                        href={`/aplicaciones/${String(aplicacion._id)}`}
                        className="text-[#3b6ef5] hover:underline"
                      >
                        Ver detalles →
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