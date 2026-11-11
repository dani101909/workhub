const COLORES_AVATAR = [
  "bg-indigo-50 text-indigo-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-purple-50 text-purple-600",
  "bg-rose-50 text-rose-600",
  "bg-sky-50 text-sky-600",
];

// "TechNova Solutions" -> "TN", "Forma Studio" -> "FS"
export function iniciales(nombre) {
  const palabras = nombre.split(/\s+/).filter(Boolean);
  const primera = palabras[0] || "";
  const mayusculaInterna = primera.slice(1).match(/[A-Z]/);
  if (mayusculaInterna) return (primera[0] + mayusculaInterna[0]).toUpperCase();
  return palabras
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

// Asigna siempre el mismo color a la misma empresa
export function colorAvatar(nombre) {
  let suma = 0;
  for (const letra of nombre) suma += letra.charCodeAt(0);
  return COLORES_AVATAR[suma % COLORES_AVATAR.length];
}