import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerContextoEmpresa } from "@/lib/empresa";
import Company from "@/models/Company";
import CompanyForm from "@/components/CompanyForm";

export default async function PerfilEmpresaPage() {
  const ctx = await obtenerContextoEmpresa();
  if (!ctx) redirect("/login");

  await connectDB();
  const e = await Company.findById(ctx.empresaId).lean();
  if (!e) redirect("/login");

  const empresa = {
    nombre: e.nombre ?? "",
    sector: e.sector ?? "",
    ubicacion: e.ubicacion ?? "",
    tamano: e.tamano ?? "",
    descripcion: e.descripcion ?? "",
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
        Perfil de empresa
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Así verán tu empresa los candidatos en la sección Empresas
      </p>
      <CompanyForm empresa={empresa} />
    </div>
  );
}
