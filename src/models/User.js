import mongoose from "mongoose";

const ExperienciaSchema = new mongoose.Schema(
  {
    puesto: { type: String, required: true, trim: true },
    empresa: { type: String, required: true, trim: true },
    desde: { type: String, trim: true },
    hasta: { type: String, trim: true, default: "Presente" },
    descripcion: { type: String, trim: true },
  },
  { _id: false }
);

const CertificacionSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    emisor: { type: String, trim: true },
    anio: { type: Number },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    rol: {
      type: String,
      enum: ["candidato", "empresa"],
      default: "candidato",
    },
    titular: { type: String, trim: true },
    ubicacion: { type: String, trim: true },
    aniosExperiencia: { type: Number, min: 0 },
    linkedin: { type: String, trim: true },
    sobreMi: { type: String, trim: true },
    habilidades: [{ type: String, trim: true }],
    experiencia: [ExperienciaSchema],
    certificaciones: [CertificacionSchema],
    cvUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);