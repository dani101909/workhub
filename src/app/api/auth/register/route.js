import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { guardarSesion } from "@/lib/auth";
import User from "@/models/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const { nombre, email, password } = await request.json();

    if (!nombre || !email || !password) {
      return Response.json(
        { ok: false, error: "Nombre, correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return Response.json(
        { ok: false, error: "El correo no tiene un formato válido" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { ok: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    await connectDB();

    const existente = await User.findOne({ email: email.toLowerCase() });
    if (existente) {
      return Response.json(
        { ok: false, error: "Ya existe una cuenta con ese correo" },
        { status: 409 }
      );
    }

    const passwordCifrada = await bcrypt.hash(password, 10);

    // El rol siempre inicia como "candidato"; no se acepta desde el formulario
    const usuario = await User.create({
      nombre,
      email,
      password: passwordCifrada,
    });

    await guardarSesion(usuario);

    return Response.json(
      {
        ok: true,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { ok: false, error: "Error al registrar el usuario" },
      { status: 500 }
    );
  }
}