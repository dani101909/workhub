import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import User from "@/models/User";

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

    const usuario = await User.findById(sesion.id).select("-password");

    if (!usuario) {
      return Response.json(
        { ok: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true, usuario });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Error al obtener la sesión" },
      { status: 500 }
    );
  }
}