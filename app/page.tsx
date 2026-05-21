"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  ok: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [validandoSesion, setValidandoSesion] = useState(true);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function verificarSesion() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          router.push("/dashboard");
          return;
        }
      } catch {
        // Si falla, permanece en login
      } finally {
        setValidandoSesion(false);
      }
    }

    verificarSesion();
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensaje("");

    if (email.trim() === "" || password.trim() === "") {
      setMensaje("Completa correo y contrasena.");
      return;
    }

    setCargando(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.ok) {
        setMensaje(data.message || "Credenciales incorrectas.");
        setCargando(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
      setCargando(false);
    }
  }

  if (validandoSesion) {
    return (
      <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#f5f7fb] px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-5 shadow-lg">
          <p className="text-sm font-semibold text-slate-700">
            Validando sesion...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#f5f7fb] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,_#eef6ff_0%,_#f9fafb_48%,_#fff6ef_100%)]" />

      <div className="absolute left-[18%] top-[52%] h-[340px] w-[340px] -translate-y-1/2 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="absolute right-[18%] top-[45%] h-[320px] w-[320px] -translate-y-1/2 rounded-full bg-orange-100/45 blur-3xl" />
      <div className="absolute left-[45%] bottom-[-120px] h-[300px] w-[300px] rounded-full bg-blue-100/40 blur-3xl" />

      <section className="relative z-10 flex h-screen w-screen items-center justify-center px-8">
        <div className="grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1fr_390px]">
          <div className="hidden lg:flex lg:items-center lg:justify-start">
            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center justify-center gap-1">
                  <span className="h-7 w-7 rounded-full bg-sky-300/90" />
                  <span className="h-10 w-10 rounded-full bg-blue-600/90" />
                  <span className="h-7 w-7 rounded-full bg-slate-900/90" />
                </div>

                <h2 className="text-6xl font-extrabold tracking-tight text-slate-800">
                  Servautt
                </h2>
              </div>

              <p className="text-2xl font-semibold text-slate-600">
                Inicia sesion para continuar . . .
              </p>

              <p className="mt-4 max-w-md text-base leading-7 text-slate-500">
                Plataforma administrativa.
              </p>

              <p className="mt-8 text-sm font-medium text-slate-400">
                © 2026. Creado con ❤ por Servautt S.A.C.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[390px] rounded-[1.7rem] border border-slate-200/80 bg-white px-8 py-8 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-200">
                <div className="flex items-center justify-center gap-1">
                  <span className="h-5 w-5 rounded-full bg-sky-300/90" />
                  <span className="h-7 w-7 rounded-full bg-blue-600/90" />
                  <span className="h-5 w-5 rounded-full bg-slate-900/90" />
                </div>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                INICIAR SESION
              </h1>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Ingresa tus credenciales para continuar al sistema.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Correo electronico*
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Ingrese su correo"
                  disabled={cargando}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Contrasena
                </label>

                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Ingrese su contrasena"
                    disabled={cargando}
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="ml-3 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
                  >
                    {mostrarPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {mensaje !== "" && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {mensaje}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {cargando ? "Ingresando..." : "Ingresar"}
              </button>

              <button
                type="button"
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                <span className="text-base">🔒</span>
                Olvidaste tu contrasena?
              </button>
            </form>

            <div className="mt-7 flex items-center justify-between gap-4 text-xs text-slate-500">
              <button type="button" className="transition hover:text-slate-700">
                Privacidad
              </button>

              <button type="button" className="transition hover:text-slate-700">
                Terminos
              </button>

              <span>© 2026 Servautt</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}