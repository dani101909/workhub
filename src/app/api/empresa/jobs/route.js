import { obtenerContextoEmpresa, limpiarVacante } from "@/lib/empresa";
import Job from "@/models/Job";

// Publicar una vacante nueva (solo empresas)
export async function POST(request) {
  try {
    const ctx = await obtenerContextoEmpresa();
    if (!ctx) {
      return Response.json(
        { ok: false, error: "Solo las empresas pueden publicar vacantes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { error, datos } = limpiarVacante(body);
    if (error) {
      return Response.json({ ok: false, error }, { status: 400 });
    }

    // La empresa siempre es la del usuario con sesión, nunca la que mande el cliente
    const vacante = await Job.create({ ...datos, empresa: ctx.empresaId });

    return Response.json({ ok: true, vacante }, { status: 201 });
  } catch (error) {
    console.error("ERROR CREAR VACANTE:", error);
    return Response.json(
      { ok: false, error: "Error al publicar la vacante" },
      { status: 500 }
    );
  }
}
