"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { iniciales, colorAvatar } from "@/lib/formato";

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#3b6ef5] focus:outline-none focus:ring-2 focus:ring-[#3b6ef5]/20";

function Campo({ etiqueta, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{etiqueta}</span>
      {children}
    </label>
  );
}

function Seccion({ titulo, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">{titulo}</h2>
      {children}
    </section>
  );
}

const Vacio = ({ children }) => <p className="text-sm text-slate-400">{children}</p>;

export default function ProfileForm({ usuario }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState(null);
  const [habilidadesTexto, setHabilidadesTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  function empezarEdicion() {
    setDatos(structuredClone(usuario));
    setHabilidadesTexto(usuario.habilidades.join(", "));
    setError("");
    setExito(false);
    setEditando(true);
  }

  function cambiar(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  function cambiarFila(lista, i, campo, valor) {
    setDatos((d) => ({
      ...d,
      [lista]: d[lista].map((fila, j) => (j === i ? { ...fila, [campo]: valor } : fila)),
    }));
  }

  function agregarFila(lista, vacia) {
    setDatos((d) => ({ ...d, [lista]: [...d[lista], vacia] }));
  }

  function quitarFila(lista, i) {
    setDatos((d) => ({ ...d, [lista]: d[lista].filter((_, j) => j !== i) }));
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...datos,
          habilidades: habilidadesTexto.split(",").map((h) => h.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar el perfil");
        return;
      }
      setEditando(false);
      setExito(true);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  }

  // ---------- Modo edición ----------
  if (editando && datos) {
    return (
      <form onSubmit={guardar} className="space-y-6">
        <Seccion titulo="Información básica">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre completo">
              <input className={input} value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} required />
            </Campo>
            <Campo etiqueta="Titular profesional">
              <input className={input} value={datos.titular} placeholder="Ej. Desarrolladora Full Stack" onChange={(e) => cambiar("titular", e.target.value)} />
            </Campo>
            <Campo etiqueta="Ubicación">
              <input className={input} value={datos.ubicacion} placeholder="Ej. Monterrey, N.L." onChange={(e) => cambiar("ubicacion", e.target.value)} />
            </Campo>
            <Campo etiqueta="Años de experiencia">
              <input className={input} type="number" min="0" max="60" value={datos.aniosExperiencia} onChange={(e) => cambiar("aniosExperiencia", e.target.value)} />
            </Campo>
            <Campo etiqueta="LinkedIn">
              <input className={input} value={datos.linkedin} placeholder="https://linkedin.com/in/..." onChange={(e) => cambiar("linkedin", e.target.value)} />
            </Campo>
            <Campo etiqueta="Enlace a tu CV">
              <input className={input} value={datos.cvUrl} placeholder="https://drive.google.com/..." onChange={(e) => cambiar("cvUrl", e.target.value)} />
            </Campo>
          </div>
        </Seccion>

        <Seccion titulo="Sobre mí">
          <textarea className={input} rows={4} maxLength={1000} value={datos.sobreMi} placeholder="Cuéntales a las empresas quién eres" onChange={(e) => cambiar("sobreMi", e.target.value)} />
        </Seccion>

        <Seccion titulo="Habilidades">
          <Campo etiqueta="Sepáralas con comas">
            <input className={input} value={habilidadesTexto} placeholder="React, Node.js, MongoDB" onChange={(e) => setHabilidadesTexto(e.target.value)} />
          </Campo>
        </Seccion>

        <Seccion titulo="Experiencia laboral">
          <div className="space-y-4">
            {datos.experiencia.map((exp, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={input} placeholder="Puesto" value={exp.puesto} onChange={(e) => cambiarFila("experiencia", i, "puesto", e.target.value)} />
                  <input className={input} placeholder="Empresa" value={exp.empresa} onChange={(e) => cambiarFila("experiencia", i, "empresa", e.target.value)} />
                  <input className={input} placeholder="Desde (Ej. Ene 2023)" value={exp.desde} onChange={(e) => cambiarFila("experiencia", i, "desde", e.target.value)} />
                  <input className={input} placeholder="Hasta (vacío = Presente)" value={exp.hasta} onChange={(e) => cambiarFila("experiencia", i, "hasta", e.target.value)} />
                </div>
                <textarea className={`${input} mt-3`} rows={2} placeholder="Descripción" value={exp.descripcion} onChange={(e) => cambiarFila("experiencia", i, "descripcion", e.target.value)} />
                <button type="button" onClick={() => quitarFila("experiencia", i)} className="mt-2 text-xs font-semibold text-red-500 hover:underline">
                  Quitar
                </button>
              </div>
            ))}
            <button type="button" onClick={() => agregarFila("experiencia", { puesto: "", empresa: "", desde: "", hasta: "", descripcion: "" })} className="text-sm font-semibold text-[#3b6ef5] hover:underline">
              + Agregar experiencia
            </button>
          </div>
        </Seccion>

        <Seccion titulo="Certificaciones">
          <div className="space-y-3">
            {datos.certificaciones.map((cert, i) => (
              <div key={i} className="grid items-center gap-3 sm:grid-cols-[1fr_1fr_90px_auto]">
                <input className={input} placeholder="Nombre" value={cert.nombre} onChange={(e) => cambiarFila("certificaciones", i, "nombre", e.target.value)} />
                <input className={input} placeholder="Emisor" value={cert.emisor} onChange={(e) => cambiarFila("certificaciones", i, "emisor", e.target.value)} />
                <input className={input} type="number" placeholder="Año" value={cert.anio} onChange={(e) => cambiarFila("certificaciones", i, "anio", e.target.value)} />
                <button type="button" onClick={() => quitarFila("certificaciones", i)} className="text-xs font-semibold text-red-500 hover:underline">
                  Quitar
                </button>
              </div>
            ))}
            <button type="button" onClick={() => agregarFila("certificaciones", { nombre: "", emisor: "", anio: "" })} className="text-sm font-semibold text-[#3b6ef5] hover:underline">
              + Agregar certificación
            </button>
          </div>
        </Seccion>

        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={guardando} className="rounded-lg bg-[#3b6ef5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f5fe0] disabled:opacity-60">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button type="button" onClick={() => setEditando(false)} disabled={guardando} className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  // ---------- Modo lectura ----------
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold ${colorAvatar(usuario.nombre)}`}>
            {iniciales(usuario.nombre)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-slate-900">{usuario.nombre}</h2>
            <p className="text-sm text-slate-600">{usuario.titular || "Agrega tu titular profesional"}</p>
            <p className="mt-1 text-xs text-slate-500">
              {[usuario.ubicacion, usuario.aniosExperiencia !== "" && `${usuario.aniosExperiencia} años de experiencia`, usuario.email]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
              {usuario.linkedin && (
                <a href={usuario.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#3b6ef5] hover:underline">LinkedIn ↗</a>
              )}
              {usuario.cvUrl && (
                <a href={usuario.cvUrl} target="_blank" rel="noopener noreferrer" className="text-[#3b6ef5] hover:underline">Ver CV ↗</a>
              )}
            </div>
          </div>
          <button type="button" onClick={empezarEdicion} className="rounded-lg bg-[#3b6ef5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2f5fe0]">
            Editar perfil
          </button>
        </div>
        {exito && <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">Perfil actualizado ✓</p>}
      </section>

      <Seccion titulo="Sobre mí">
        {usuario.sobreMi ? <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{usuario.sobreMi}</p> : <Vacio>Aún no has escrito nada.</Vacio>}
      </Seccion>

      <Seccion titulo="Habilidades">
        {usuario.habilidades.length ? (
          <div className="flex flex-wrap gap-2">
            {usuario.habilidades.map((h) => (
              <span key={h} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#3b6ef5]">{h}</span>
            ))}
          </div>
        ) : <Vacio>Agrega tus habilidades.</Vacio>}
      </Seccion>

      <Seccion titulo="Experiencia laboral">
        {usuario.experiencia.length ? (
          <ul className="space-y-4">
            {usuario.experiencia.map((e, i) => (
              <li key={i}>
                <p className="text-sm font-semibold text-slate-900">{e.puesto}</p>
                <p className="text-xs text-slate-500">{e.empresa} · {e.desde || "—"} – {e.hasta || "Presente"}</p>
                {e.descripcion && <p className="mt-1 text-sm text-slate-600">{e.descripcion}</p>}
              </li>
            ))}
          </ul>
        ) : <Vacio>Agrega tu experiencia.</Vacio>}
      </Seccion>

      <Seccion titulo="Certificaciones">
        {usuario.certificaciones.length ? (
          <ul className="space-y-2">
            {usuario.certificaciones.map((c, i) => (
              <li key={i} className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{c.nombre}</span>
                {c.emisor && ` · ${c.emisor}`}
                {c.anio && ` · ${c.anio}`}
              </li>
            ))}
          </ul>
        ) : <Vacio>Agrega tus certificaciones.</Vacio>}
      </Seccion>
    </div>
  );
}
