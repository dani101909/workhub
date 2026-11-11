import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import Job from "@/models/Job";
import Company from "@/models/Company";

// Evita que caracteres especiales del buscador rompan la expresión regular
function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  try {
    const sesion = await obtenerSesion();
    if (!sesion) {
      return Response.json(
        { ok: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const categoria = searchParams.get("categoria");
    const modalidad = searchParams.get("modalidad");

    await connectDB();

    const filtro = { activa: true };
    if (categoria && categoria !== "Todos") filtro.categoria = categoria;
    if (modalidad && modalidad !== "Todos") filtro.modalidad = modalidad;

    // El buscador revisa título, descripción, habilidades y nombre de la empresa
    if (q) {
      const regex = new RegExp(escaparRegex(q), "i");
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
      .sort({ createdAt: -1 });

    return Response.json({ ok: true, total: vacantes.length, vacantes });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Error al obtener las vacantes" },
      { status: 500 }
    );
  }
}