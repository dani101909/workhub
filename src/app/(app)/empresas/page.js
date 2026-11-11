import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import Job from "@/models/Job";
import { iniciales, colorAvatar } from "@/lib/formato";

function Estrellas({ valor }) {
  const llenas = Math.min(5, Math.max(0, Math.round(valor ?? 0)));

  return (
    <span className="flex items-center gap-1.5">
      <span className="text-xs tracking-wider text-amber-400">
        {"★".repeat(llenas)}
        <span className="text-slate-300">{"☆".repeat(5 - llenas)}</span>
      </span>
      <span className="text-xs text-slate-500">
        {valor != null ? valor.toFixed(1) : "–"}
      </span>
    </span>
  );
}

export default async function EmpresasPage() {
  await connectDB();

  const empresas = await Company.find().sort({ createdAt: 1, _id: 1 }).lean();

  // Cuenta cuántas vacantes activas tiene cada empresa
  const conteos = await Job.aggregate([
    { $match: { activa: true } },
    { $group: { _id: "$empresa", total: { $sum: 1 } } },
  ]);
  const mapa = new Map(conteos.map((c) => [String(c._id), c.total]));

  return (
    <div>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
        Empresas contratando
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        {empresas.length} {empresas.length === 1 ? "empresa activa" : "empresas activas"}
      </p>

      {empresas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Todavía no hay empresas registradas.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {empresas.map((empresa) => {
            const vacantes = mapa.get(String(empresa._id)) || 0;

            return (
              <article
                key={String(empresa._id)}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${colorAvatar(
                      empresa.nombre
                    )}`}
                  >
                    {iniciales(empresa.nombre)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-[family-name:var(--font-outfit)] text-base font-bold text-slate-900">
                      {empresa.nombre}
                    </h2>
                    <p className="text-xs text-slate-500">{empresa.sector}</p>
                    <Estrellas valor={empresa.calificacion} />
                  </div>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                  {empresa.descripcion}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">
                    📍 {empresa.ubicacion}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">
                    👥 {empresa.tamano}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#3b6ef5]">
                    {vacantes} {vacantes === 1 ? "vacante abierta" : "vacantes abiertas"}
                  </p>
                  <Link
                    href={`/vacantes?q=${encodeURIComponent(empresa.nombre)}`}
                    className="rounded-lg border border-[#3b6ef5] px-4 py-1.5 text-sm font-semibold text-[#3b6ef5] transition hover:bg-blue-50"
                  >
                    Ver empresa
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}