"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type AdminLayoutProps = {
  children: React.ReactNode;
};

type UserSession = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type MeResponse = {
  ok: boolean;
  message?: string;
  user?: UserSession;
};

type MenuItem = {
  label: string;
  href: string;
  roles: string[];
  icon: string;
};

const menuItems: MenuItem[] = [
  {
    label: "Analytics",
    href: "/dashboard",
    roles: ["ADMIN", "SUPERVISOR", "OPERADOR"],
    icon: "⌂",
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    roles: ["ADMIN"],
    icon: "◌",
  },
  {
    label: "Servicios",
    href: "/servicios",
    roles: ["ADMIN", "SUPERVISOR", "OPERADOR"],
    icon: "◇",
  },
  {
    label: "Reportes",
    href: "/reportes",
    roles: ["ADMIN", "SUPERVISOR"],
    icon: "▣",
  },
  {
    label: "Configuración",
    href: "/configuracion",
    roles: ["ADMIN"],
    icon: "⚙",
  },
];

function getPageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Analytics";
  if (pathname === "/usuarios") return "Usuarios";
  if (pathname === "/servicios") return "Servicios";
  if (pathname === "/reportes") return "Reportes";
  if (pathname === "/configuracion") return "Configuración";

  return "Panel";
}

function getBreadcrumb(pathname: string) {
  if (pathname === "/dashboard") return "Moondy / Dashboards / Analytics";
  if (pathname === "/usuarios") return "Moondy / Seguridad / Usuarios";
  if (pathname === "/servicios") return "Moondy / Operaciones / Servicios";
  if (pathname === "/reportes") return "Moondy / Reportes / General";
  if (pathname === "/configuracion") return "Moondy / Sistema / Configuración";

  return "Moondy / Panel";
}

function userCanAccessPath(pathname: string, role: string) {
  const menuItem = menuItems.find((item) => item.href === pathname);

  if (!menuItem) {
    return true;
  }

  return menuItem.roles.includes(role);
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(null);
  const [validando, setValidando] = useState(true);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  useEffect(() => {
    async function validarSesion() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = (await response.json()) as MeResponse;

        if (!response.ok || !data.ok || !data.user) {
          router.push("/");
          return;
        }

        if (!userCanAccessPath(pathname, data.user.role)) {
          router.push("/dashboard");
          return;
        }

        setUser(data.user);
      } catch {
        router.push("/");
      } finally {
        setValidando(false);
      }
    }

    validarSesion();
  }, [router, pathname]);

  async function handleLogout() {
    setCerrandoSesion(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Aunque falle, igual regresamos al login.
    } finally {
      router.push("/");
    }
  }

  if (validando) {
    return (
      <main className="min-h-screen bg-[#edf3f7] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-8 py-6">
          <p className="text-slate-600 font-medium">Validando sesión...</p>
        </div>
      </main>
    );
  }

  const visibleMenuItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-[#edf3f7] flex text-slate-800">
      <aside className="hidden lg:flex w-[62px] bg-[#002b27] flex-col items-center py-5">
        <div className="w-10 h-10 rounded-full bg-[#0b8f83] flex items-center justify-center">
          <div className="w-7 h-7 rounded-full border-[4px] border-yellow-300 border-t-transparent" />
        </div>

        <div className="mt-14 flex flex-col gap-6">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={
                  isActive
                    ? "w-10 h-10 rounded-xl text-teal-300 flex items-center justify-center text-xl"
                    : "w-10 h-10 rounded-xl text-white/45 hover:text-teal-200 flex items-center justify-center text-xl transition"
                }
              >
                {item.icon}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            disabled={cerrandoSesion}
            title="Cerrar sesión"
            className="w-10 h-10 rounded-xl text-white/45 hover:text-red-300 transition text-lg"
          >
            ⏻
          </button>
        </div>
      </aside>

      <aside className="hidden md:flex w-[185px] bg-white border-r border-slate-200 flex-col">
        <div className="h-[86px] px-5 flex items-center">
          <h1 className="text-[22px] font-black tracking-wide text-slate-900">
            MOONDY
          </h1>
        </div>

        <nav className="flex-1 px-4 py-5">
          <p className="text-[12px] font-bold text-slate-400 mb-5">
            DASHBOARDS
          </p>

          <div className="space-y-2">
            {visibleMenuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "block rounded-md bg-teal-50 px-3 py-3 text-[15px] font-black text-teal-700"
                      : "block rounded-md px-3 py-3 text-[15px] font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-700 transition"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="px-4 py-5 border-t border-slate-100">
          <button
            onClick={handleLogout}
            disabled={cerrandoSesion}
            className="w-full rounded-md bg-slate-50 px-3 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            {cerrandoSesion ? "Saliendo..." : "Salir"}
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-[58px] bg-white border-b border-slate-200 px-5 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button className="text-slate-500 text-2xl leading-none">≡</button>

            <div className="hidden sm:flex w-full max-w-[360px] h-[38px] items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4">
              <span className="text-slate-400 text-sm">⌕</span>
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent outline-none text-sm text-slate-600 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-sm hover:bg-slate-200 transition">
              ◐
            </button>

            <button className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-sm hover:bg-slate-200 transition">
              ♧
            </button>

            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-500 text-white flex items-center justify-center text-sm font-black ml-1">
              {user?.name?.charAt(0).toUpperCase() ?? "A"}
            </div>
          </div>
        </header>

        <main className="px-5 md:px-7 pt-4 pb-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-black text-slate-900 leading-tight">
                {getPageTitle(pathname)}
              </h2>
              <p className="text-[13px] text-slate-400 mt-1 leading-tight">
                {getBreadcrumb(pathname)}
              </p>
            </div>

            {pathname === "/dashboard" && (
              <Link
                href="/usuarios"
                className="rounded-md bg-[#079b8f] px-5 py-3 text-[14px] font-black text-white hover:bg-[#07887e] transition shadow-sm"
              >
                Create New
              </Link>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}