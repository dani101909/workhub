import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    descripcion: { type: String, trim: true },
    ubicacion: { type: String, trim: true },
    modalidad: {
      type: String,
      enum: ["Remoto", "Híbrido", "Presencial"],
      required: true,
    },
    tipo: { type: String, trim: true, default: "Tiempo completo" },
    categoria: {
      type: String,
      enum: ["Tecnología", "Marketing", "Diseño", "Datos", "Finanzas", "Otro"],
      default: "Otro",
    },
    salarioMin: { type: Number, min: 0 },
    salarioMax: { type: Number, min: 0 },
    habilidades: [{ type: String, trim: true }],
    destacado: { type: Boolean, default: false },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model("Job", JobSchema);