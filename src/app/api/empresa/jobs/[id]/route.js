import mongoose from "mongoose";
import { obtenerContextoEmpresa, limpiarVacante } from "@/lib/empresa";
import Job from "@/models/Job";

async function validar(params) {
  const ctx = await obtenerContextoEmpresa();
  if (!ctx) {
    return {
      respuesta: Response.json(
        { ok: false, error: "Solo las empresas pueden hacer esto" },
        { status: 403 }
      ),
    };
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return {
      respuesta: Response.json(
        { ok: false, error: "La vacante no es válida" },
        { status: 400 }
      ),
    };
  }
  // Solo se puede tocar una vacante de la propia empresa
  const vacante = await Job.findOne({ _id: id, empresa: ctx.empresaId });
  if (!vacante) {
    return {
      respuesta: Response.json(
        { ok: false, error: "Vacante no encontrada" },
        { status: 404 }
      ),
    };
  }
  return { vacante };
}

// Editar los datos de la vacante
export async function PUT(request, { params }) {
  try {
    const { vacante, respuesta } = await validar(params);
    if (respuesta) return respuesta;

    const { error, datos, quitar } = limpiarVacante(await request.json());
    if (error) {
      return Response.json({ ok: false, error }, { status: 400 });
    }

    const operacion = { $set: datos };
    if (quitar.length) {
      operacion.$unset = Object.fromEntries(quitar.map((c) => [c, ""]));
    }
    await Job.updateOne({ _id: vacante._id }, operacion, { runValidators: true });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("ERROR EDITAR VACANTE:", error);
    return Response.json(
      { ok: false, error: "Error al guardar la vacante" },
      { status: 500 }
    );
  }
}

// Cerrar o reabrir la vacante
export async function PATCH(request, { params }) {
  try {
    const { vacante, respuesta } = await validar(params);
    if (respuesta) return respuesta;

    const { activa } = await request.json();
    if (typeof activa !== "boolean") {
      return Response.json(
        { ok: false, error: "Valor no válido" },
        { status: 400 }
      );
    }

    await Job.updateOne({ _id: vacante._id }, { $set: { activa } });
    return Response.json({ ok: true, activa });
  } catch (error) {
    console.error("ERROR CAMBIAR VACANTE:", error);
    return Response.json(
      { ok: false, error: "Error al actualizar la vacante" },
      { status: 500 }
    );
  }
}
