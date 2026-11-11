import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerSesion } from "@/lib/auth";
import User from "@/models/User";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

// "Sofía Ramírez Torres" -> "SR"
function obtenerIniciales(nombre) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

export default async function AppLayout({ children }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  await connectDB();
  const usuario = await User.findById(sesion.id).select("nombre rol").lean();
  if (!usuario) redirect("/login");

  // Las cuentas de empresa usan su propio panel
  if (usuario.rol === "empresa") redirect("/empresa/vacantes");

  return (
    <div className="flex min-h-screen bg-[#f1f4f9] text-slate-900">
      <Sidebar
        nombre={usuario.nombre}
        iniciales={obtenerIniciales(usuario.nombre)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}