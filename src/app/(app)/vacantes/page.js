import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import Job from "@/models/Job";
import Company from "@/models/Company";
import Application from "@/models/Application";
import ApplyButton from "@/components/ApplyButton";
import { iniciales, colorAvatar } from "@/lib/formato";

const CATEGORIAS = ["Todos", "Tecnología", "Marketing", "Diseño", "Datos", "Finanzas"];
const MODALIDADES = ["Todos", "Remoto", "Híbrido", "Presencial"];

const COLORES_MODALIDAD = {
  Remoto: "bg-emerald-50 text-emerald-700",
  "Híbrido": "bg-blue-50 text-blue-700",
  Presencial: "bg-slate-100 text-slate-600",
};

// Si el parámetro viene repetido en la dirección, nos quedamos con el primero
function primero(valor) {
  return Array.isArray(valor) ? valor[0] : valor;
}

// Evita que caracteres especiales del buscador rompan la expresión regular
function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatearSalario(min, max) {
  if (min == null && max == null) return "Salario no especificado";
  const formato = (n) => `$${Number(n).toLocaleString("en-US")}`;
  if (min != null && max != null) return `${formato(min)} – ${formato(max)} MXN`;
  return `${formato(min ?? max)} MXN`;
}

function tiempoTranscurrido(fecha) {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
  if (dias < 1) return "Hoy";
  if (dias === 1) return "Hace 1 día";
  if (dias < 7) return `Hace ${dias} días`;
  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return semanas === 1 ? "Hace 1 semana" : `Hace ${semanas} semanas`;
  }
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "Hace 1 mes" : `Hace ${meses} meses`;
}

// Arma la dirección del filtro conservando lo que ya estaba seleccionado
function construirHref(actuales, cambios) {
  const params = new URLSearchParams();
  const todos = { ...actuales, ...cambios };
  for (const [clave, valor] of Object.entries(todos)) {
    if (valor && valor !== "Todos") params.set(clave, valor);
  }
  const texto = params.toString();
  return texto ? `/vacantes?${texto}` : "/vacantes";
}

export default async function VacantesPage({ searchParams }) {
  const parametros = await searchParams;
  const busqueda = primero(parametros.q)?.trim() || "";
  const categoriaPedida = primero(parametros.categoria);
  const modalidadPedida = primero(parametros.modalidad);

  const categoria = CATEGORIAS.includes(categoriaPedida) ? categoriaPedida : "Todos";
  const modalidad = MODALIDADES.includes(modalidadPedida) ? modalidadPedida : "Todos";
  const actuales = { q: busqueda, categoria, modalidad };

  await connectDB();

  const filtro = { activa: true };
  if (categoria !== "Todos") filtro.categoria = categoria;
  if (modalidad !== "Todos") filtro.modalidad = modalidad;

  // El buscador revisa título, descripción, habilidades y nombre de la empresa
  if (busqueda) {
    const regex = new RegExp(escaparRegex(busqueda), "i");
    const empresas = await Company.find({ nombre: regex }).select("_id");

    filtro.$or = [
      { titulo: regex },
      { descripcion: regex },
      { habilidades: regex },
      { empresa: { $in: empresas.map((e) => e._id) } },
    ];
  }

  const vacantes = await Job.find(filtro)
    .populate("empresa", "nombre ubicacion")
    .sort({ createdAt: -1 })
    .lean();

  // Vacantes a las que este usuario ya aplicó
  const sesion = await obtenerSesion();
  const aplicadas = sesion
    ? await Application.find({ usuario: sesion.id }).select("vacante").lean()
    : [];
  const idsAplicadas = new Set(aplicadas.map((a) => String(a.vacante)));

  return (
    <div>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
        Vacantes disponibles
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        {vacantes.length}{" "}
        {vacantes.length === 1 ? "oportunidad encontrada" : "oportunidades encontradas"}
        {busqueda && ` para "${busqueda}"`}
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {CATEGORIAS.map((c) => (
          <Link
            key={c}
            href={construirHref(actuales, { categoria: c })}
            className={`rounded-lg border bg-white px-4 py-1.5 text-sm font-medium transition ${
              categoria === c
                ? "border-[#3b6ef5] text-[#3b6ef5]"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
          >
            {c}
          </Link>
        ))}

        <span className="mx-1 h-6 w-px bg-slate-300" />

        {MODALIDADES.map((m) => (
          <Link
            key={m}
            href={construirHref(actuales, { modalidad: m })}
            className={`rounded-lg border bg-white px-4 py-1.5 text-sm font-medium transition ${
              modalidad === m
                ? "border-emerald-500 text-emerald-600"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
          >
            {m}
          </Link>
        ))}
      </div>

      {vacantes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No encontramos vacantes con esos filtros. Prueba con otra búsqueda.
        </div>
      ) : (
        <div className="space-y-4">
          {vacantes.map((vacante) => {
            const nombreEmpresa = vacante.empresa?.nombre ?? "Empresa";

            return (
              <article
                key={String(vacante._id)}
                className="relative flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {vacante.destacado && (
                  <span className="absolute right-0 top-0 rounded-bl-lg rounded-tr-2xl bg-[#13203f] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Destacado
                  </span>
                )}

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${colorAvatar(
                    nombreEmpresa
                  )}`}
                >
                  {iniciales(nombreEmpresa)}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-[family-name:var(--font-outfit)] text-base font-bold text-slate-900">
                    {vacante.titulo}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {nombreEmpresa} · {vacante.ubicacion}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {vacante.descripcion}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded px-2 py-1 text-[11px] font-semibold uppercase ${
                        COLORES_MODALIDAD[vacante.modalidad] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {vacante.modalidad}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">
                      {vacante.tipo}
                    </span>
                    {vacante.habilidades?.map((habilidad) => (
                      <span
                        key={habilidad}
                        className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-500"
                      >
                        {habilidad}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      {formatearSalario(vacante.salarioMin, vacante.salarioMax)}
                    </p>
                    <ApplyButton
                      vacanteId={String(vacante._id)}
                      yaAplicada={idsAplicadas.has(String(vacante._id))}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {tiempoTranscurrido(vacante.createdAt)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}