import { borrarSesion } from "@/lib/auth";

export async function POST() {
  await borrarSesion();
  return Response.json({ ok: true, mensaje: "Sesión cerrada" });
}