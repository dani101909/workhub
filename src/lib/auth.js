import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Falta la variable JWT_SECRET en .env.local");
}

export const COOKIE_NAME = "workhub_token";
const SIETE_DIAS = 60 * 60 * 24 * 7; // en segundos

// Crea el pase firmado con el id y el rol del usuario
function crearToken(usuario) {
  return jwt.sign(
    { id: usuario._id.toString(), rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: SIETE_DIAS }
  );
}

// Guarda el pase en una cookie que JavaScript del navegador no puede leer
export async function guardarSesion(usuario) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, crearToken(usuario), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SIETE_DIAS,
    path: "/",
  });
}

export async function borrarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Devuelve { id, rol } si hay sesión válida, o null si no
export async function obtenerSesion() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}