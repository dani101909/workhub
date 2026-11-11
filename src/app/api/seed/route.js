import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";
import Job from "@/models/Job";

// Devuelve una fecha de hace N días (para simular "Hace 2 días", etc.)
function diasAtras(dias) {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
}

export async function POST() {
  // Ruta solo para desarrollo: en producción no hace nada
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { ok: false, error: "No disponible en producción" },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    // Para no duplicar datos si se ejecuta dos veces
    if ((await Company.countDocuments()) > 0) {
      return Response.json(
        { ok: false, error: "Ya existen empresas; no se cargaron datos de ejemplo" },
        { status: 409 }
      );
    }

    const [technova, growthlab, datapulse, forma, altus] =
      await Company.create([
        {
          nombre: "TechNova Solutions",
          sector: "Tecnología",
          descripcion:
            "Empresa líder en desarrollo de software empresarial con clientes en toda LATAM.",
          ubicacion: "Ciudad de México",
          tamano: "200-500",
          calificacion: 4.6,
        },
        {
          nombre: "GrowthLab Agency",
          sector: "Marketing Digital",
          descripcion:
            "Agencia de crecimiento digital enfocada en e-commerce y startups de alto impacto.",
          ubicacion: "Monterrey, NL",
          tamano: "50-200",
          calificacion: 4.3,
        },
        {
          nombre: "DataPulse Corp.",
          sector: "Analytics & BI",
          descripcion:
            "Plataforma de inteligencia de negocios para el sector retail y manufactura.",
          ubicacion: "Guadalajara, JAL",
          tamano: "100-200",
          calificacion: 4.1,
        },
        {
          nombre: "Forma Studio",
          sector: "Diseño & Creatividad",
          descripcion:
            "Estudio de diseño especializado en productos digitales, branding y sistemas de diseño.",
          ubicacion: "Ciudad de México",
          tamano: "10-50",
          calificacion: 4.8,
        },
        {
          nombre: "Grupo Financiero Altus",
          sector: "Finanzas",
          descripcion:
            "Grupo financiero con más de 25 años ofreciendo servicios de inversión y consultoría.",
          ubicacion: "Monterrey, NL",
          tamano: "500+",
          calificacion: 3.9,
        },
        {
          nombre: "Constructora Impulso",
          sector: "Construcción",
          descripcion:
            "Empresa constructora especializada en proyectos habitacionales y de infraestructura.",
          ubicacion: "Puebla, PUE",
          tamano: "200-500",
          calificacion: 4.0,
        },
      ]);

    await Job.create([
      {
        titulo: "Frontend Developer Senior",
        empresa: technova._id,
        descripcion:
          "Buscamos un Frontend Senior apasionado por la UX para sumarse a nuestro equipo de producto.",
        ubicacion: "Ciudad de México",
        modalidad: "Remoto",
        tipo: "Tiempo completo",
        categoria: "Tecnología",
        salarioMin: 45000,
        salarioMax: 60000,
        habilidades: ["React", "TypeScript", "Tailwind"],
        destacado: true,
        createdAt: diasAtras(2),
      },
      {
        titulo: "Gerente de Marketing Digital",
        empresa: growthlab._id,
        descripcion:
          "Lidera estrategias de crecimiento digital para nuestros clientes de e-commerce.",
        ubicacion: "Monterrey, NL",
        modalidad: "Híbrido",
        tipo: "Tiempo completo",
        categoria: "Marketing",
        salarioMin: 38000,
        salarioMax: 52000,
        habilidades: ["SEO", "SEM", "Analítica"],
        createdAt: diasAtras(3),
      },
      {
        titulo: "Analista de Datos Jr.",
        empresa: datapulse._id,
        descripcion:
          "Apoya al equipo de inteligencia de negocios en la generación de reportes y dashboards.",
        ubicacion: "Guadalajara, JAL",
        modalidad: "Presencial",
        tipo: "Tiempo completo",
        categoria: "Datos",
        salarioMin: 22000,
        salarioMax: 30000,
        habilidades: ["Python", "SQL", "Power BI"],
        createdAt: diasAtras(5),
      },
      {
        titulo: "Diseñador UX/UI",
        empresa: forma._id,
        descripcion:
          "Diseña experiencias digitales centradas en el usuario para productos SaaS B2B.",
        ubicacion: "Ciudad de México",
        modalidad: "Remoto",
        tipo: "Tiempo completo",
        categoria: "Diseño",
        salarioMin: 30000,
        salarioMax: 42000,
        habilidades: ["Figma", "Prototyping", "Design Systems"],
        destacado: true,
        createdAt: diasAtras(7),
      },
      {
        titulo: "Contador Público Certificado",
        empresa: altus._id,
        descripcion:
          "Gestiona la contabilidad mensual, el cierre fiscal y el cumplimiento regulatorio.",
        ubicacion: "Monterrey, NL",
        modalidad: "Presencial",
        tipo: "Tiempo completo",
        categoria: "Finanzas",
        salarioMin: 28000,
        salarioMax: 36000,
        habilidades: ["Contabilidad", "Fiscal", "Excel"],
        createdAt: diasAtras(9),
      },
      {
        titulo: "Backend Engineer Node.js",
        empresa: technova._id,
        descripcion:
          "Desarrolla y mantiene los servicios y APIs que sostienen nuestra plataforma.",
        ubicacion: "Ciudad de México",
        modalidad: "Remoto",
        tipo: "Tiempo completo",
        categoria: "Tecnología",
        salarioMin: 40000,
        salarioMax: 55000,
        habilidades: ["Node.js", "MongoDB", "APIs"],
        createdAt: diasAtras(11),
      },
    ]);

    return Response.json({
      ok: true,
      mensaje: "Se cargaron 6 empresas y 6 vacantes de ejemplo",
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}