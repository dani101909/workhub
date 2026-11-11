import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerContextoEmpresa } from "@/lib/empresa";
import Company from "@/models/Company";
import VacanteForm from "@/components/VacanteForm";

export default async function NuevaVacantePage() {
  const ctx = await obtenerContextoEmpresa();
  if (!ctx) redirect("/login");

  await connectDB();
  const empresa = await Company.findById(ctx.empresaId).select("ubicacion").lean();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
        Nueva vacante
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Completa los datos para publicarla en la bolsa de trabajo
      </p>
      <VacanteForm ubicacionInicial={empresa?.ubicacion ?? ""} />
    </div>
  );
}
