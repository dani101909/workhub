import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    sector: { type: String, trim: true },
    descripcion: { type: String, trim: true },
    ubicacion: { type: String, trim: true },
    tamano: { type: String, trim: true },
    calificacion: { type: Number, min: 0, max: 5 },
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);