// Constantes compartidas (sin imports de servidor, se pueden usar en el navegador)
export const MODALIDADES = ["Remoto", "Híbrido", "Presencial"];
export const CATEGORIAS = ["Tecnología", "Marketing", "Diseño", "Datos", "Finanzas", "Otro"];
export const TIPOS = ["Tiempo completo", "Medio tiempo", "Prácticas", "Por proyecto"];
export const ESTADOS = ["En revisión", "Entrevista", "Oferta", "Rechazado"];

// Etapa que se muestra al candidato según el estado
export const ETAPA_POR_ESTADO = {
  "En revisión": "Evaluación inicial",
  Entrevista: "Entrevista programada",
  Oferta: "Oferta enviada",
  Rechazado: "Proceso cerrado",
};

export const COLORES_ESTADO = {
  "En revisión": "bg-amber-100 text-amber-700",
  Entrevista: "bg-blue-100 text-blue-700",
  Oferta: "bg-emerald-100 text-emerald-700",
  Rechazado: "bg-red-100 text-red-600",
};
