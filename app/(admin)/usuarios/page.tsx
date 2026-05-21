"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type UsersResponse = {
  ok: boolean;
  message?: string;
  users?: User[];
  user?: User;
};

type ModalType = "create" | "edit" | "password" | null;

const roles = ["ADMIN", "SUPERVISOR", "OPERADOR"];

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("OPERADOR");
  const [formPassword, setFormPassword] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    try {
      setLoading(true);
      setMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/users", {
        method: "GET",
        credentials: "include",
      });

      const data = (await response.json()) as UsersResponse;

      if (!response.ok || !data.ok) {
        setMessage(data.message || "No se pudo cargar la lista de usuarios.");
        setUsers([]);
        return;
      }

      setUsers(data.users || []);
    } catch {
      setMessage("No se pudo conectar con el servidor.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function abrirNuevoUsuario() {
    setMessage("");
    setSuccessMessage("");
    setSelectedUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("OPERADOR");
    setFormPassword("");
    setModalType("create");
  }

  function abrirEditarUsuario(user: User) {
    setMessage("");
    setSuccessMessage("");
    setSelectedUser(user);
    setFormName(user.name || "");
    setFormEmail(user.email || "");
    setFormRole(user.role || "OPERADOR");
    setFormPassword("");
    setModalType("edit");
  }

  function abrirCambiarPassword(user: User) {
    setMessage("");
    setSuccessMessage("");
    setSelectedUser(user);
    setFormPassword("");
    setModalType("password");
  }

  function cerrarModal() {
    if (saving) return;

    setModalType(null);
    setSelectedUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("OPERADOR");
    setFormPassword("");
    setMessage("");
  }

  async function guardarUsuario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setMessage("");
    setSuccessMessage("");

    const name = formName.trim();
    const email = formEmail.trim().toLowerCase();
    const role = formRole.trim().toUpperCase();
    const password = formPassword.trim();

    if (!name || !email) {
      setMessage("Nombre y correo son obligatorios.");
      return;
    }

    if (modalType === "create" && !password) {
      setMessage("La contraseña es obligatoria.");
      return;
    }

    if (modalType === "create" && password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!roles.includes(role)) {
      setMessage("Rol no válido.");
      return;
    }

    try {
      setSaving(true);

      const isEdit = modalType === "edit" && selectedUser !== null;

      const response = await fetch(
        isEdit ? `/api/users/${selectedUser.id}` : "/api/users",
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            role,
            ...(modalType === "create" ? { password } : {}),
          }),
        }
      );

      const data = (await response.json()) as UsersResponse;

      if (!response.ok || !data.ok) {
        setMessage(data.message || "No se pudo guardar el usuario.");
        return;
      }

      cerrarModal();
      setSuccessMessage(data.message || "Usuario guardado correctamente.");
      await cargarUsuarios();
    } catch {
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  async function guardarPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser || saving) return;

    setMessage("");
    setSuccessMessage("");

    const password = formPassword.trim();

    if (!password) {
      setMessage("La nueva contraseña es obligatoria.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/users/${selectedUser.id}/password`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      const data = (await response.json()) as UsersResponse;

      if (!response.ok || !data.ok) {
        setMessage(data.message || "No se pudo cambiar la contraseña.");
        return;
      }

      cerrarModal();
      setSuccessMessage(data.message || "Contraseña actualizada correctamente.");
      await cargarUsuarios();
    } catch {
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstado(user: User) {
    setMessage("");
    setSuccessMessage("");

    const accion = user.active ? "desactivar" : "activar";

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion} al usuario ${user.name}?`
    );

    if (!confirmar) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !user.active,
        }),
      });

      const data = (await response.json()) as UsersResponse;

      if (!response.ok || !data.ok) {
        setMessage(data.message || "No se pudo cambiar el estado del usuario.");
        return;
      }

      setSuccessMessage(data.message || "Estado actualizado correctamente.");
      await cargarUsuarios();
    } catch {
      setMessage("No se pudo conectar con el servidor.");
    }
  }

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value) ||
        String(user.id).includes(value)
      );
    });
  }, [users, search]);

  return (
    <section className="max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Moondy / Seguridad / Usuarios
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevoUsuario}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
        >
          Nuevo usuario
        </button>
      </div>

      {successMessage && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
          {successMessage}
        </div>
      )}

      {message && modalType === null && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {message}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Lista de usuarios
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Total registrados: {users.length}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar usuario..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-80"
            />

            <button
              type="button"
              onClick={cargarUsuarios}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Actualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
            Cargando usuarios...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                    Correo
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm font-medium text-slate-500"
                    >
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">
                            {user.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-bold text-slate-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              ID #{user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={
                            user.active
                              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700"
                          }
                        >
                          {user.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-4 text-sm font-bold">
                          <button
                            type="button"
                            onClick={() => abrirEditarUsuario(user)}
                            className="text-blue-600 transition hover:text-blue-800"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirCambiarPassword(user)}
                            className="text-violet-600 transition hover:text-violet-800"
                          >
                            Contraseña
                          </button>

                          <button
                            type="button"
                            onClick={() => cambiarEstado(user)}
                            className={
                              user.active
                                ? "text-red-600 transition hover:text-red-800"
                                : "text-green-600 transition hover:text-green-800"
                            }
                          >
                            {user.active ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-xl font-black text-slate-900">
                {modalType === "create" && "Nuevo usuario"}
                {modalType === "edit" && "Editar usuario"}
                {modalType === "password" && "Cambiar contraseña"}
              </h3>

              {selectedUser && (
                <p className="mt-1 text-sm text-slate-500">
                  Usuario: {selectedUser.name}
                </p>
              )}
            </div>

            {message && (
              <div className="mx-6 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {message}
              </div>
            )}

            {(modalType === "create" || modalType === "edit") && (
              <form onSubmit={guardarUsuario} className="space-y-4 px-6 py-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    placeholder="Nombre del usuario"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(event) => setFormEmail(event.target.value)}
                    placeholder="correo@sistema.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Rol
                  </label>
                  <select
                    value={formRole}
                    onChange={(event) => setFormRole(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="OPERADOR">OPERADOR</option>
                  </select>
                </div>

                {modalType === "create" && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(event) => setFormPassword(event.target.value)}
                      placeholder="Contraseña inicial"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            )}

            {modalType === "password" && (
              <form onSubmit={guardarPassword} className="space-y-4 px-6 py-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(event) => setFormPassword(event.target.value)}
                    placeholder="Ingrese nueva contraseña"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:bg-violet-300"
                  >
                    {saving ? "Guardando..." : "Cambiar contraseña"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}