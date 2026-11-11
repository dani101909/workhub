import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import User from "@/models/User";

const texto = (v, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

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
    const usuario = await User.findById(sesion.id).select("-password").lean();
    if (!usuario) {
      return Response.json(
        { ok: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return Response.json({ ok: true, usuario });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Error al obtener el perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const sesion = await obtenerSesion();
    if (!sesion) {
      return Response.json(
        { ok: false, error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const nombre = texto(body.nombre, 100);
    if (!nombre) {
      return Response.json(
        { ok: false, error: "El nombre no puede estar vacío" },
        { status: 400 }
      );
    }

    let aniosExperiencia;
    if (body.aniosExperiencia !== "" && body.aniosExperiencia != null) {
      aniosExperiencia = Number(body.aniosExperiencia);
      if (!Number.isFinite(aniosExperiencia) || aniosExperiencia < 0 || aniosExperiencia > 60) {
        return Response.json(
          { ok: false, error: "Los años de experiencia no son válidos" },
          { status: 400 }
        );
      }
    }

    const habilidades = Array.isArray(body.habilidades)
      ? [...new Set(body.habilidades.map((h) => texto(h, 40)).filter(Boolean))].slice(0, 30)
      : [];

    // Se descartan las filas incompletas (sin puesto/empresa o sin nombre)
    const experiencia = Array.isArray(body.experiencia)
      ? body.experiencia
          .map((e) => ({
            puesto: texto(e?.puesto, 100),
            empresa: texto(e?.empresa, 100),
            desde: texto(e?.desde, 30),
            hasta: texto(e?.hasta, 30) || "Presente",
            descripcion: texto(e?.descripcion, 500),
          }))
          .filter((e) => e.puesto && e.empresa)
          .slice(0, 20)
      : [];

    const certificaciones = Array.isArray(body.certificaciones)
      ? body.certificaciones
          .map((c) => {
            const anio = Number(c?.anio);
            return {
              nombre: texto(c?.nombre, 120),
              emisor: texto(c?.emisor, 100),
              anio: Number.isFinite(anio) && anio > 1950 && anio < 2100 ? anio : undefined,
            };
          })
          .filter((c) => c.nombre)
          .slice(0, 20)
      : [];

    await connectDB();

    const cambios = {
      nombre,
      titular: texto(body.titular, 100),
      ubicacion: texto(body.ubicacion, 100),
      linkedin: texto(body.linkedin, 200),
      sobreMi: texto(body.sobreMi, 1000),
      cvUrl: texto(body.cvUrl, 300),
      habilidades,
      experiencia,
      certificaciones,
    };
    const operacion = { $set: cambios };
    if (aniosExperiencia === undefined) operacion.$unset = { aniosExperiencia: "" };
    else cambios.aniosExperiencia = aniosExperiencia;

    // Nunca se actualizan email, password ni rol desde aquí
    const usuario = await User.findByIdAndUpdate(sesion.id, operacion, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();

    return Response.json({ ok: true, usuario });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Error al guardar el perfil" },
      { status: 500 }
    );
  }
}
