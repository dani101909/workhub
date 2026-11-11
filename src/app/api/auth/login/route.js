import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { guardarSesion } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { ok: false, error: "Correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    await connectDB();

    const usuario = await User.findOne({ email: email.toLowerCase() });

    // Mismo mensaje si el correo no existe o la contraseña es incorrecta,
    // para no dar pistas sobre qué correos están registrados
    const credencialesValidas =
      usuario && (await bcrypt.compare(password, usuario.password));

    if (!credencialesValidas) {
      return Response.json(
        { ok: false, error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    await guardarSesion(usuario);

    return Response.json({
      ok: true,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}