import mongoose from "mongoose";
import { obtenerContextoEmpresa } from "@/lib/empresa";
import { ESTADOS, ETAPA_POR_ESTADO } from "@/lib/constantes";
import Application from "@/models/Application";
import Job from "@/models/Job";

// Cambiar el estado de una aplicación recibida
export async function PATCH(request, { params }) {
  try {
    const ctx = await obtenerContextoEmpresa();
    if (!ctx) {
      return Response.json(
        { ok: false, error: "Solo las empresas pueden hacer esto" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { estado } = await request.json();

    if (!mongoose.isValidObjectId(id) || !ESTADOS.includes(estado)) {
      return Response.json(
        { ok: false, error: "Datos no válidos" },
        { status: 400 }
      );
    }

    const aplicacion = await Application.findById(id);
    // La vacante debe pertenecer a la empresa que hace el cambio
    const vacante = aplicacion
      ? await Job.findOne({ _id: aplicacion.vacante, empresa: ctx.empresaId })
      : null;

    if (!aplicacion || !vacante) {
      return Response.json(
        { ok: false, error: "Aplicación no encontrada" },
        { status: 404 }
      );
    }

    aplicacion.estado = estado;
    aplicacion.etapa = ETAPA_POR_ESTADO[estado];
    await aplicacion.save();

    return Response.json({ ok: true, estado, etapa: aplicacion.etapa });
  } catch (error) {
    console.error("ERROR CAMBIAR ESTADO:", error);
    return Response.json(
      { ok: false, error: "Error al actualizar el estado" },
      { status: 500 }
    );
  }
}
