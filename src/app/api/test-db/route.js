import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ ok: true, mensaje: "Conexión a MongoDB exitosa" });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}