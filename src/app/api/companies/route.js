import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import Company from "@/models/Company";
import Job from "@/models/Job";

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

    const empresas = await Company.find().sort({ createdAt: 1, _id: 1 }).lean();

    // Cuenta cuántas vacantes activas tiene cada empresa
    const conteos = await Job.aggregate([
      { $match: { activa: true } },
      { $group: { _id: "$empresa", total: { $sum: 1 } } },
    ]);
    const mapa = new Map(conteos.map((c) => [c._id.toString(), c.total]));

    const resultado = empresas.map((empresa) => ({
      ...empresa,
      vacantesAbiertas: mapa.get(empresa._id.toString()) || 0,
    }));

    return Response.json({
      ok: true,
      total: resultado.length,
      empresas: resultado,
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Error al obtener las empresas" },
      { status: 500 }
    );
  }
}