import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import User from "@/models/User";
import { MODALIDADES, CATEGORIAS, TIPOS } from "@/lib/constantes";

// Devuelve { usuario, empresaId } solo si hay sesión y el usuario es de rol
// "empresa" con una empresa ligada. Se revisa contra la base de datos, no
// solo contra el token, para que un cambio de rol surta efecto de inmediato.
export async function obtenerContextoEmpresa() {
  const sesion = await obtenerSesion();
  if (!sesion) return null;

  await connectDB();
  const usuario = await User.findById(sesion.id)
    .select("nombre rol empresa")
    .lean();

  if (!usuario || usuario.rol !== "empresa" || !usuario.empresa) return null;
  return { usuario, empresaId: String(usuario.empresa) };
}

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function numero(v) {
  if (v === "" || v == null) return { ok: true, valor: undefined };
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 10000000) return { ok: false };
  return { ok: true, valor: n };
}

// Valida y limpia los datos de una vacante (alta y edición)
// Devuelve { error } o { datos, quitar } (quitar = campos opcionales a borrar)
export function limpiarVacante(body) {
  const titulo = texto(body.titulo, 120);
  const descripcion = texto(body.descripcion, 1000);
  const ubicacion = texto(body.ubicacion, 100);

  if (!titulo) return { error: "El título es obligatorio" };
  if (!descripcion) return { error: "La descripción es obligatoria" };
  if (!ubicacion) return { error: "La ubicación es obligatoria" };
  if (!MODALIDADES.includes(body.modalidad)) {
    return { error: "La modalidad no es válida" };
  }

  const min = numero(body.salarioMin);
  const max = numero(body.salarioMax);
  if (!min.ok || !max.ok) return { error: "El salario no es válido" };
  if (min.valor != null && max.valor != null && min.valor > max.valor) {
    return { error: "El salario mínimo no puede ser mayor que el máximo" };
  }

  const lista = Array.isArray(body.habilidades)
    ? body.habilidades
    : typeof body.habilidades === "string"
    ? body.habilidades.split(",")
    : [];
  const habilidades = [
    ...new Set(lista.map((h) => texto(h, 40)).filter(Boolean)),
  ].slice(0, 15);

  const datos = {
    titulo,
    descripcion,
    ubicacion,
    modalidad: body.modalidad,
    tipo: TIPOS.includes(body.tipo) ? body.tipo : "Tiempo completo",
    categoria: CATEGORIAS.includes(body.categoria) ? body.categoria : "Otro",
    habilidades,
  };
  const quitar = [];
  if (min.valor != null) datos.salarioMin = min.valor;
  else quitar.push("salarioMin");
  if (max.valor != null) datos.salarioMax = max.valor;
  else quitar.push("salarioMax");

  return { datos, quitar };
}
