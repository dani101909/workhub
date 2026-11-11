import mongoose from "mongoose";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { obtenerContextoEmpresa } from "@/lib/empresa";
import Job from "@/models/Job";
import VacanteForm from "@/components/VacanteForm";

export default async function EditarVacantePage({ params }) {
  const ctx = await obtenerContextoEmpresa();
  if (!ctx) redirect("/login");

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();
  // Solo se puede editar una vacante de la propia empresa
  const v = await Job.findOne({ _id: id, empresa: ctx.empresaId }).lean();
  if (!v) notFound();

  const vacante = {
    id: String(v._id),
    titulo: v.titulo ?? "",
    descripcion: v.descripcion ?? "",
    ubicacion: v.ubicacion ?? "",
    modalidad: v.modalidad,
    tipo: v.tipo,
    categoria: v.categoria,
    salarioMin: v.salarioMin ?? "",
    salarioMax: v.salarioMax ?? "",
    habilidades: v.habilidades ?? [],
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-slate-900">
        Editar vacante
      </h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">{vacante.titulo}</p>
      <VacanteForm vacante={vacante} />
    </div>
  );
}
