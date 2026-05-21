import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";

type ChangePasswordBody = {
  password?: string;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN"]);

    const { id } = await context.params;
    const userId = Number(id);

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "ID de usuario no válido." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as ChangePasswordBody;
    const password = body.password?.trim();

    if (!password) {
      return NextResponse.json(
        { ok: false, message: "La nueva contraseña es obligatoria." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, message: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        active: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada correctamente.",
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
        { ok: false, message: "No tienes permisos para cambiar contraseñas." },
        { status: 403 }
      );
    }

    console.error("Error cambiando contraseña:", error);

    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}