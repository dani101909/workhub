import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import Application from "@/models/Application";
import Job from "@/models/Job";
import "@/models/Company";

export async function POST(request) {
  try {
    const sesion = await obtenerSesion();
    if (!sesion) {
      return Response.json(
        { ok: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const { vacanteId } = await request.json();

    if (!vacanteId || !mongoose.isValidObjectId(vacanteId)) {
      return Response.json(
        { ok: false, error: "La vacante no es válida" },
        { status: 400 }
      );
    }

    await connectDB();

    const vacante = await Job.findOne({ _id: vacanteId, activa: true });
    if (!vacante) {
      return Response.json(
        { ok: false, error: "La vacante ya no está disponible" },
        { status: 404 }
      );
    }

    await Application.create({ usuario: sesion.id, vacante: vacante._id });

    return Response.json(
      { ok: true, mensaje: "Aplicación enviada" },
      { status: 201 }
    );
  } catch (error) {
    // Código de MongoDB para "registro duplicado": ya había aplicado
    if (error.code === 11000) {
      return Response.json(
        { ok: false, error: "Ya aplicaste a esta vacante" },
        { status: 409 }
      );
    }

    return Response.json(
      { ok: false, error: "Error al enviar la aplicación" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sesion = await obtenerSesion();
    if (!sesion) {
      return Response.json(
        { ok: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    await connectDB();

    const aplicaciones = await Application.find({ usuario: sesion.id })
      .populate({
        path: "vacante",
        select: "titulo empresa",
        populate: { path: "empresa", select: "nombre" },
      })
      .sort({ createdAt: -1 });

    return Response.json({
      ok: true,
      total: aplicaciones.length,
      aplicaciones,
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Error al obtener las aplicaciones" },
      { status: 500 }
    );
  }
}