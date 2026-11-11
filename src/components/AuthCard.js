"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const claseLabel =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600";
const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#3b6ef5] focus:outline-none focus:ring-2 focus:ring-[#3b6ef5]/20";

export default function AuthCard() {
  const router = useRouter();
  const [modo, setModo] = useState("login"); // "login" o "registro"
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState("candidato"); // "candidato" o "empresa"
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const esLogin = modo === "login";

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setError("");
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const ruta = esLogin ? "/api/auth/login" : "/api/auth/register";
      const cuerpo = esLogin
        ? { email, password }
        : { nombre, email, password, tipo, nombreEmpresa };

      const res = await fetch(ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Ocurrió un error, intenta de nuevo");
        return;
      }

      router.push(
        data.usuario?.rol === "empresa" ? "/empresa/vacantes" : "/vacantes"
      );
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="w-full max-w-[380px] rounded-3xl bg-[#f8f8f9] p-8 shadow-2xl">
      <div className="mb-8 flex rounded-xl bg-[#eceef2] p-1">
        <button
          type="button"
          onClick={() => cambiarModo("login")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            esLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => cambiarModo("registro")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            !esLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Registrarse
        </button>
      </div>

      <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-slate-900">
        {esLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}
      </h2>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        {esLogin
          ? "Ingresa tus credenciales para continuar."
          : "Completa tus datos para comenzar."}
      </p>

      <form onSubmit={enviar} className="space-y-4">
        {!esLogin && (
          <div className="flex rounded-xl bg-[#eceef2] p-1">
            {[
              { valor: "candidato", etiqueta: "Soy candidato" },
              { valor: "empresa", etiqueta: "Soy empresa" },
            ].map((op) => (
              <button
                key={op.valor}
                type="button"
                onClick={() => setTipo(op.valor)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                  tipo === op.valor
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {op.etiqueta}
              </button>
            ))}
          </div>
        )}

        {!esLogin && tipo === "empresa" && (
          <div>
            <label className={claseLabel} htmlFor="nombreEmpresa">
              Nombre de la empresa
            </label>
            <input
              id="nombreEmpresa"
              type="text"
              required
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              placeholder="Ej. TechNova Solutions"
              className={claseInput}
            />
          </div>
        )}

        {!esLogin && (
          <div>
            <label className={claseLabel} htmlFor="nombre">
              {tipo === "empresa" ? "Tu nombre (representante)" : "Nombre completo"}
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className={claseInput}
            />
          </div>
        )}

        <div>
          <label className={claseLabel} htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className={claseInput}
          />
        </div>

        <div>
          <label className={claseLabel} htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={esLogin ? undefined : 6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={claseInput}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-[#3b6ef5] py-3 text-sm font-semibold text-white transition hover:bg-[#2f5fe0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando
            ? "Un momento..."
            : esLogin
            ? "Iniciar sesión"
            : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}