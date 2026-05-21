import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-server";

type CreateUserBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
};

const allowedRoles = ["ADMIN", "OPERADOR", "SUPERVISOR"];

export async function GET() {
  try {
    await requireRole(["ADMIN"]);

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
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
      users,
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
        { ok: false, message: "No tienes permisos para ver usuarios." },
        { status: 403 }
      );
    }

    console.error("Error listando usuarios:", error);

    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const body = (await request.json()) as CreateUserBody;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();
    const role = body.role?.trim().toUpperCase() || "OPERADOR";

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, message: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { ok: false, message: "Rol no válido." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Ya existe un usuario con ese correo." },
        { status: 409 }
      );
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        active: true,
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

    return NextResponse.json(
      {
        ok: true,
        message: "Usuario creado correctamente.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, message: "No autenticado." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { ok: false, message: "No tienes permisos para crear usuarios." },
        { status: 403 }
      );
    }

    console.error("Error creando usuario:", error);

    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}