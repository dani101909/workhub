import Link from "next/link";
import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerContextoEmpresa } from "@/lib/empresa";
import Application from "@/models/Application";
import Job from "@/models/Job";
import User from "@/models/User";
import EstadoSelect from "@/components/EstadoSelect";
import { iniciales, colorAvatar } from "@/lib/formato";

function Seccion({ titulo, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{titulo}</h2>
      {children}
    </section>
  );
}

export default async function DetalleCandidatoPage({ params }) {
  const ctx = await obtenerContextoEmpresa();
  if (!ctx) redirect("/login");

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();

  const aplicacion = await Application.findById(id)
    .populate({ path: "vacante", model: Job, select: "titulo empresa" })
    .populate({ path: "usuario", model: User, select: "-password" })
    .lean();

  // Solo se puede ver el perfil de quien aplicó a una vacante de esta empresa
  if (!aplicacion || String(aplicacion.vacante?.empresa) !== ctx.empresaId) {
    notFound();
  }

  const u = aplicacion.usuario;
  if (!u) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/empresa/candidatos" className="text-sm font-semibold text-[#3b6ef5] hover:underline">
        ← Volver a candidatos
      </Link>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold ${colorAvatar(u.nombre)}`}>
            {iniciales(u.nombre)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-slate-900">{u.nombre}</h1>
            <p className="text-sm text-slate-600">{u.titular || "Sin titular profesional"}</p>
            <p className="mt-1 text-xs text-slate-500">
              {[u.ubicacion, u.aniosExperiencia != null && `${u.aniosExperiencia} años de experiencia`, u.email]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <div className="mt-2 flex gap-3 text-xs font-semibold">
              {u.linkedin && <a href={u.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#3b6ef5] hover:underline">LinkedIn ↗</a>}
              {u.cvUrl && <a href={u.cvUrl} target="_blank" rel="noopener noreferrer" className="text-[#3b6ef5] hover:underline">Ver CV ↗</a>}
            </div>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Aplicó a: {aplicacion.vacante.titulo}
            </p>
            <EstadoSelect aplicacionId={String(aplicacion._id)} estadoInicial={aplicacion.estado} />
          </div>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        <Seccion titulo="Sobre mí">
          {u.sobreMi ? <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{u.sobreMi}</p> : <p className="text-sm text-slate-400">No escribió nada.</p>}
        </Seccion>

        <Seccion titulo="Habilidades">
          {u.habilidades?.length ? (
            <div className="flex flex-wrap gap-2">
              {u.habilidades.map((h) => (
                <span key={h} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#3b6ef5]">{h}</span>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400">Sin habilidades registradas.</p>}
        </Seccion>

        <Seccion titulo="Experiencia laboral">
          {u.experiencia?.length ? (
            <ul className="space-y-4">
              {u.experiencia.map((e, i) => (
                <li key={i}>
                  <p className="text-sm font-semibold text-slate-900">{e.puesto}</p>
                  <p className="text-xs text-slate-500">{e.empresa} · {e.desde || "—"} – {e.hasta || "Presente"}</p>
                  {e.descripcion && <p className="mt-1 text-sm text-slate-600">{e.descripcion}</p>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-400">Sin experiencia registrada.</p>}
        </Seccion>

        <Seccion titulo="Certificaciones">
          {u.certificaciones?.length ? (
            <ul className="space-y-2">
              {u.certificaciones.map((c, i) => (
                <li key={i} className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">{c.nombre}</span>
                  {c.emisor && ` · ${c.emisor}`}
                  {c.anio && ` · ${c.anio}`}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-400">Sin certificaciones registradas.</p>}
        </Seccion>
      </div>
    </div>
  );
}
