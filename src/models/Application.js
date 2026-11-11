import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vacante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    estado: {
      type: String,
      enum: ["En revisión", "Entrevista", "Oferta", "Rechazado"],
      default: "En revisión",
    },
    etapa: { type: String, trim: true, default: "Evaluación inicial" },
  },
  { timestamps: true }
);

// Un usuario solo puede aplicar una vez a la misma vacante
ApplicationSchema.index({ usuario: 1, vacante: 1 }, { unique: true });

export default
  mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);