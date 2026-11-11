import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerContextoEmpresa } from "@/lib/empresa";
import Job from "@/models/Job";
import Application from "@/models/Application";
import VacanteAcciones from "@/components/VacanteAcciones";

function formatearSalario(min, max) {
  if (min == null && max == null) return "No especificado";
  const f = (n) => `$${Number(n).toLocaleString("en-US")}`;
  if (min != null && max != null) return `${f(min)} – ${f(max)}`;
  return f(min ?? max);
}

export default async function MisVacantesPage() {
  const ctx = await obtenerContextoEmpresa();
  if (!ctx) redirect("/login");

  await connectDB();

  const vacantes = await Job.find({ empresa: ctx.empresaId })
    .sort({ createdAt: -1 })
    .lean();

  const ids = vacantes.map((v) => v._id);
  const conteos = await Application.aggregate([
    { $match: { vacante: { $in: ids } } },
    {
      $group: {
        _id: "$vacante",
        total: { $sum: 1 },
        entrevistas: { $sum: { $cond: [{ $eq: ["$estado", "Entrevista"] }, 1, 0] } },
      },
    },
  ]);
  const mapa = new Map(conteos.map((c) => [String(c._id), c]));

  const activas = vacantes.filter((v) => v.activa).length;
  const totalCandidatos = conteos.reduce((s, c) => s + c.total, 0);
  const totalEntrevistas = conteos.reduce((s, c) => s + c.entrevistas, 0);

  const tarjetas = [
    { etiqueta: "Vacantes activas", valor: activas, caja: "border-blue-100 bg-blue-50", numero: "text-[#3b6ef5]" },
    { etiqueta: "Candidatos recibidos", valor: totalCandidatos, caja: "border-emerald-100 bg-emerald-50", numero: "text-emerald-500" },
    { etiqueta: "En entrevista", valor: totalEntrevistas, caja: "border-amber-100 bg-amber-50", numero: "text-amber-500" },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
        Mis vacantes
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Publica y administra las vacantes de tu empresa
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tarjetas.map((t) => (
          <div key={t.etiqueta} className={`rounded-2xl border p-6 ${t.caja}`}>
            <p className={`font-[family-name:var(--font-outfit)] text-3xl font-bold ${t.numero}`}>{t.valor}</p>
            <p className="mt-1 text-sm text-slate-600">{t.etiqueta}</p>
          </div>
        ))}
      </div>

      {vacantes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Aún no has publicado vacantes.{" "}
          <Link href="/empresa/vacantes/nueva" className="font-semibold text-[#3b6ef5] hover:underline">
            Publica la primera
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Puesto</th>
                <th className="px-6 py-4">Modalidad</th>
                <th className="px-6 py-4">Salario (MXN)</th>
                <th className="px-6 py-4">Candidatos</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vacantes.map((v) => {
                const id = String(v._id);
                const total = mapa.get(id)?.total ?? 0;
                return (
                  <tr key={id} className="border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{v.titulo}</p>
                      <p className="text-xs text-slate-500">{v.ubicacion} · {v.categoria}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{v.modalidad}</td>
                    <td className="px-6 py-4 text-slate-600">{formatearSalario(v.salarioMin, v.salarioMax)}</td>
                    <td className="px-6 py-4">
                      {total > 0 ? (
                        <Link href={`/empresa/candidatos?vacante=${id}`} className="font-semibold text-[#3b6ef5] hover:underline">
                          {total}
                        </Link>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded px-2 py-1 text-[11px] font-semibold uppercase ${v.activa ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {v.activa ? "Activa" : "Cerrada"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <VacanteAcciones vacanteId={id} activa={v.activa} />
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
