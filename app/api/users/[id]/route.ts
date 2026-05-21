import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";

type UpdateUserBody = {
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
};

const allowedRoles = ["ADMIN", "OPERADOR", "SUPERVISOR"];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireRole(["ADMIN"]);

    const { id } = await context.params;
    const userId = Number(id);

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "ID de usuario no válido." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateUserBody;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const role = body.role?.trim().toUpperCase();
    const active = body.active;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { ok: false, message: "Ya existe otro usuario con ese correo." },
          { status: 409 }
        );
      }
    }

    if (role && !allowedRoles.includes(role)) {
      return NextResponse.json(
        { ok: false, message: "Rol no válido." },
        { status: 400 }
      );
    }

    if (authUser.id === userId && active === false) {
      return NextResponse.json(
        { ok: false, message: "No puedes desactivar tu propio usuario." },
        { status: 400 }
      );
    }

    if (authUser.id === userId && role && role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, message: "No puedes quitarte el rol ADMIN a ti mismo." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(role ? { role } : {}),
        ...(typeof active === "boolean" ? { active } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Usuario actualizado correctamente.",
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, message: "No autenticado." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { ok: false, message: "No tienes permisos para actualizar usuarios." },
        { status: 403 }
      );
    }

    console.error("Error actualizando usuario:", error);

    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}