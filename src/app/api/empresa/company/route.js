import { obtenerContextoEmpresa } from "@/lib/empresa";
import Company from "@/models/Company";

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Editar el perfil de la propia empresa
export async function PUT(request) {
  try {
    const ctx = await obtenerContextoEmpresa();
    if (!ctx) {
      return Response.json(
        { ok: false, error: "Solo las empresas pueden hacer esto" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const nombre = texto(body.nombre, 100);
    if (!nombre) {
      return Response.json(
        { ok: false, error: "El nombre de la empresa es obligatorio" },
        { status: 400 }
      );
    }

    await Company.updateOne(
      { _id: ctx.empresaId },
      {
        $set: {
          nombre,
          sector: texto(body.sector, 100),
          descripcion: texto(body.descripcion, 1000),
          ubicacion: texto(body.ubicacion, 100),
          tamano: texto(body.tamano, 50),
        },
      }
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error("ERROR PERFIL EMPRESA:", error);
    return Response.json(
      { ok: false, error: "Error al guardar el perfil" },
      { status: 500 }
    );
  }
}
