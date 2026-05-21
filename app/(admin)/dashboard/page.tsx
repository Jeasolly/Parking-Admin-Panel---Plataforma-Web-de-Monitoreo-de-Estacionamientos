"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  supervisorUsers: number;
  operatorUsers: number;
};

type RecentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
};

type DashboardResponse = {
  ok: boolean;
  message?: string;
  stats?: DashboardStats;
  recentUsers?: RecentUser[];
};

function getRoleLabel(role: string) {
  if (role === "ADMIN") return "Administrador";
  if (role === "SUPERVISOR") return "Supervisor";
  if (role === "OPERADOR") return "Operador";
  return role;
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-md shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function MiniBars() {
  const bars = [35, 68, 94, 63, 56, 66, 61, 70];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Today"];
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div className="relative flex items-end justify-center gap-[14px] h-[130px] mt-5">
      {bars.map((value, index) => (
        <div
          key={index}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(null)}
          className="relative w-[20px] flex justify-center cursor-pointer"
        >
          {hoverIndex === index && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 rounded-md bg-slate-900 px-3 py-2 text-white shadow-lg whitespace-nowrap">
              <p className="text-[12px] font-bold">{labels[index]}</p>
              <p className="text-[12px] mt-1">
                Daily Report: <span className="font-black">{value}</span>
              </p>
            </div>
          )}

          <div
            className="w-[11px] rounded-full bg-blue-500 transition-all hover:bg-blue-600"
            style={{ height: `${value}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function DonutChart({ percent }: { percent: number }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex justify-center mt-5">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative w-[125px] h-[125px] rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: `conic-gradient(#0f8f83 ${
            percent * 3.6
          }deg, #f3bd22 0deg 260deg, #3779f6 0deg)`,
        }}
      >
        {showTooltip && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 rounded-md bg-[#0f8f83] px-4 py-2 text-white shadow-lg whitespace-nowrap">
            <p className="text-[12px] font-bold">
              Mobile: <span className="font-black">{percent}%</span>
            </p>
          </div>
        )}

        <div className="w-[88px] h-[88px] rounded-full bg-white flex items-center justify-center">
          <span className="text-2xl font-black text-slate-900">
            {percent}%
          </span>
        </div>
      </div>
    </div>
  );
}

function LineChart() {
  const points = [
    { x: 0, y: 230, label: "Jan", newVisits: 20, uniqueVisits: 45 },
    { x: 75, y: 165, label: "Feb", newVisits: 100, uniqueVisits: 60 },
    { x: 150, y: 215, label: "Mar", newVisits: 35, uniqueVisits: 25 },
    { x: 225, y: 110, label: "Apr", newVisits: 160, uniqueVisits: 90 },
    { x: 300, y: 175, label: "May", newVisits: 80, uniqueVisits: 50 },
    { x: 375, y: 70, label: "Jun", newVisits: 200, uniqueVisits: 110 },
    { x: 450, y: 160, label: "Jul", newVisits: 95, uniqueVisits: 70 },
    { x: 525, y: 35, label: "Aug", newVisits: 245, uniqueVisits: 130 },
    { x: 600, y: 190, label: "Sep", newVisits: 70, uniqueVisits: 45 },
    { x: 675, y: 85, label: "Oct", newVisits: 210, uniqueVisits: 110 },
    { x: 750, y: 145, label: "Nov", newVisits: 140, uniqueVisits: 80 },
    { x: 825, y: 75, label: "Dec", newVisits: 225, uniqueVisits: 120 },
  ];

  const [hover, setHover] = useState<(typeof points)[number] | null>(null);

  return (
    <div className="h-[360px] relative bg-white overflow-hidden">
      <div className="absolute inset-x-0 top-0 bottom-8 grid grid-rows-5 px-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="border-b border-dashed border-slate-200" />
        ))}
      </div>

      <svg
        viewBox="0 0 900 250"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-3 h-[320px] w-full"
      >
        <polyline
          points="0,230 75,165 150,215 225,110 300,175 375,70 450,160 525,35 600,190 675,85 750,145 825,75 900,30"
          fill="none"
          stroke="#0f8f83"
          strokeWidth="2"
          strokeDasharray="7 6"
        />

        <polyline
          points="0,235 75,190 150,220 225,155 300,195 375,125 450,170 525,105 600,210 675,150 750,185 825,140 900,100"
          fill="none"
          stroke="#5f718b"
          strokeWidth="2"
        />

        {points.map((point) => (
          <circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            r="12"
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHover(point)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {hover && (
        <div
          className="absolute z-30 rounded-md bg-white border border-slate-200 shadow-lg px-4 py-3 text-[13px]"
          style={{
            left: `calc(${(hover.x / 900) * 100}% - 60px)`,
            top: `${Math.max(20, hover.y - 10)}px`,
          }}
        >
          <p className="font-bold text-slate-700 mb-2">{hover.label}</p>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700" />
            <span className="text-slate-600">
              New Visits: <b>{hover.newVisits}</b>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="w-3 h-3 rounded-full bg-teal-500" />
            <span className="text-slate-600">
              Unique Visits: <b>{hover.uniqueVisits}</b>
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[12px] text-slate-400">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
      </div>
    </div>
  );
}

function SmallBounceChart() {
  const points = [
    { x: 0, y: 60, label: "Jan", income: 22, expenses: 18 },
    { x: 30, y: 50, label: "Feb", income: 40, expenses: 30 },
    { x: 60, y: 62, label: "Mar", income: 28, expenses: 24 },
    { x: 90, y: 45, label: "Apr", income: 48, expenses: 36 },
    { x: 120, y: 46, label: "May", income: 45, expenses: 32 },
    { x: 150, y: 28, label: "Jun", income: 65, expenses: 45 },
    { x: 180, y: 20, label: "Jul", income: 80, expenses: 55 },
    { x: 210, y: 12, label: "Aug", income: 90, expenses: 60 },
  ];

  const [hover, setHover] = useState<(typeof points)[number] | null>(null);

  return (
    <div className="mt-10 h-[100px] relative">
      <svg
        viewBox="0 0 240 80"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <polyline
          points="0,60 20,50 40,62 60,45 80,52 100,35 120,46 140,28 160,40 180,20 200,27 220,12 240,5"
          fill="none"
          stroke="#6d8bff"
          strokeWidth="2"
          strokeDasharray="5 5"
        />

        <polyline
          points="0,55 20,48 40,55 60,42 80,50 100,39 120,47 140,38 160,45 180,35 200,41 220,32 240,38"
          fill="none"
          stroke="#f4a15d"
          strokeWidth="2"
        />

        {points.map((point) => (
          <circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            r="10"
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHover(point)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {hover && (
        <div
          className="absolute z-30 rounded-md bg-white border border-slate-200 shadow-lg px-4 py-3 text-[13px]"
          style={{
            left: `calc(${(hover.x / 240) * 100}% - 55px)`,
            top: "-68px",
          }}
        >
          <p className="font-bold text-slate-700 mb-2">{hover.label}</p>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-slate-600">
              Income: <b>{hover.income}k</b>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600">
              Expenses: <b>{hover.expenses}k</b>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    try {
      setCargando(true);
      setMensaje("");

      const response = await fetch("/api/dashboard", {
        method: "GET",
        credentials: "include",
      });

      const data = (await response.json()) as DashboardResponse;

      if (!response.ok || !data.ok || !data.stats) {
        setMensaje(data.message || "No se pudo cargar el dashboard.");
        return;
      }

      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  const activePercent = useMemo(() => {
    if (!stats || stats.totalUsers === 0) return 0;
    return Math.round((stats.activeUsers / stats.totalUsers) * 100);
  }, [stats]);

  return (
    <section className="w-full">
      {cargando && (
        <Card className="p-10 text-center">
          <p className="text-base text-slate-500 font-medium">
            Cargando dashboard...
          </p>
        </Card>
      )}

      {!cargando && mensaje !== "" && (
        <div className="rounded-md bg-red-50 border border-red-200 px-5 py-4 text-red-700 text-base font-medium">
          {mensaje}
        </div>
      )}

      {!cargando && mensaje === "" && stats && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <Card className="min-h-[220px] p-7 flex flex-col items-center justify-center text-center">
              <h3 className="text-[22px] font-black text-slate-800">
                Good Morning Jack !
              </h3>
              <p className="text-[14px] text-slate-400 leading-6 mt-4 max-w-[260px]">
                We Design and Develop Clean and High Quality Web Applications
              </p>

              <div className="mt-5 w-[120px] h-[74px] rounded-sm border border-teal-300 bg-teal-50 flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>
            </Card>

            <Card className="min-h-[220px] p-7">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl text-slate-200">♡</span>
                  <div>
                    <h3 className="text-[32px] font-black text-slate-900 leading-none">
                      {stats.totalUsers}
                    </h3>
                    <p className="text-[14px] font-bold text-slate-500">
                      Sessions
                    </p>
                  </div>
                </div>

                <span className="rounded-sm bg-teal-50 text-teal-600 px-4 py-2 text-[12px] font-black">
                  Active
                </span>
              </div>

              <MiniBars />
            </Card>

            <Card className="min-h-[220px] p-7">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl text-slate-200">◷</span>
                  <div>
                    <h3 className="text-[32px] font-black text-slate-900 leading-none">
                      {activePercent}%
                    </h3>
                    <p className="text-[14px] font-bold text-slate-500">
                      Avg.Sessions
                    </p>
                  </div>
                </div>

                <span className="rounded-sm bg-teal-50 text-teal-600 px-4 py-2 text-[12px] font-black">
                  Active
                </span>
              </div>

              <DonutChart percent={activePercent} />

              <div className="flex justify-center gap-5 mt-4 text-[12px] text-slate-400">
                <span className="before:content-['●'] before:text-teal-600 before:mr-1">
                  Mobile
                </span>
                <span className="before:content-['●'] before:text-blue-500 before:mr-1">
                  Tablet
                </span>
                <span className="before:content-['●'] before:text-yellow-500 before:mr-1">
                  Desktop
                </span>
              </div>
            </Card>

            <Card className="min-h-[220px] p-7">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl text-slate-200">$</span>
                  <div>
                    <h3 className="text-[32px] font-black text-slate-900 leading-none">
                      {stats.adminUsers}
                    </h3>
                    <p className="text-[14px] font-bold text-slate-500">
                      Bounce Rate
                    </p>
                  </div>
                </div>

                <span className="rounded-sm bg-teal-50 text-teal-600 px-4 py-2 text-[12px] font-black">
                  Active
                </span>
              </div>

              <SmallBounceChart />
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <Card className="xl:col-span-4 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-[16px] font-black text-slate-800">
                  Unique Visits
                </h3>
              </div>

              <div className="p-5">
                <div className="h-[230px] bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center relative overflow-hidden">
                  <div className="absolute w-[260px] h-[120px] rounded-full bg-slate-200/70 blur-2xl" />
                  <div className="relative text-center">
                    <span className="text-5xl opacity-70">🗺️</span>
                    <p className="text-[14px] text-slate-400 mt-3">
                      Global Activity
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 mt-7 text-center">
                  <div>
                    <p className="text-[26px] font-black text-slate-900">
                      {stats.activeUsers}
                    </p>
                    <p className="text-[12px] font-black text-slate-400 mt-1">
                      DOMESTIC
                    </p>
                  </div>

                  <div className="border-l border-slate-100">
                    <p className="text-[26px] font-black text-slate-900">
                      {stats.inactiveUsers}
                    </p>
                    <p className="text-[12px] font-black text-slate-400 mt-1">
                      INTERNATIONAL
                    </p>
                  </div>
                </div>

                <div className="mt-7 rounded-md bg-slate-50 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🇺🇸</span>
                    <div>
                      <p className="text-[16px] font-black text-slate-800">
                        Unique Visitors Country
                      </p>
                      <p className="text-[13px] text-slate-400">Last Month</p>
                    </div>
                  </div>

                  <span className="rounded-sm border border-teal-300 bg-teal-50 text-teal-600 px-3 py-2 text-[12px] font-black">
                    {stats.totalUsers}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="xl:col-span-8 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[16px] font-black text-slate-800">
                  Audience Overview
                </h3>

                <div className="hidden sm:flex gap-5 text-[12px] text-slate-400">
                  <span className="before:content-['●'] before:text-slate-800 before:mr-1">
                    New Visits
                  </span>
                  <span className="before:content-['●'] before:text-teal-600 before:mr-1">
                    Unique Visits
                  </span>
                </div>
              </div>

              <div className="px-5 py-4">
                <LineChart />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-[16px] font-black text-slate-800">
                  Total Visits
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-[12px] font-black text-slate-500 uppercase">
                        Usuario
                      </th>
                      <th className="px-5 py-4 text-[12px] font-black text-slate-500 uppercase">
                        Rol
                      </th>
                      <th className="px-5 py-4 text-[12px] font-black text-slate-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-5 py-4">
                          <p className="text-[15px] font-black text-slate-800">
                            {user.name}
                          </p>
                          <p className="text-[13px] text-slate-400">
                            {user.email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-[15px] font-bold text-slate-600">
                          {getRoleLabel(user.role)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              user.active
                                ? "rounded-full bg-teal-50 text-teal-600 px-3 py-2 text-[12px] font-black"
                                : "rounded-full bg-red-50 text-red-600 px-3 py-2 text-[12px] font-black"
                            }
                          >
                            {user.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-[16px] font-black text-slate-800">
                  Browser Used By Users
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-[12px] font-black text-slate-500 uppercase">
                        Rol
                      </th>
                      <th className="px-5 py-4 text-[12px] font-black text-slate-500 uppercase">
                        Usuarios
                      </th>
                      <th className="px-5 py-4 text-[12px] font-black text-slate-500 uppercase">
                        Porcentaje
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {[
                      {
                        label: "Administradores",
                        value: stats.adminUsers,
                      },
                      {
                        label: "Supervisores",
                        value: stats.supervisorUsers,
                      },
                      {
                        label: "Operadores",
                        value: stats.operatorUsers,
                      },
                    ].map((item) => {
                      const percent =
                        stats.totalUsers === 0
                          ? 0
                          : Math.round((item.value / stats.totalUsers) * 100);

                      return (
                        <tr key={item.label}>
                          <td className="px-5 py-4 text-[15px] font-black text-slate-800">
                            {item.label}
                          </td>

                          <td className="px-5 py-4 text-[15px] font-bold text-slate-600">
                            {item.value}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-3 w-32 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>

                              <span className="text-[13px] font-bold text-slate-500">
                                {percent}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="px-5 py-5">
                  <Link
                    href="/usuarios"
                    className="inline-flex rounded-md bg-[#079b8f] px-5 py-3 text-[14px] font-black text-white hover:bg-[#07887e] transition"
                  >
                    Ir a usuarios
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}