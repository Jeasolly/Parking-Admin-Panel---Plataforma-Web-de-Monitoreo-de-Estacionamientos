import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginBody;

    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { ok: false, message: "Credenciales incorrectas." },
        { status: 401 }
      );
    }

    const passwordValid = await argon2.verify(user.passwordHash, password);

    if (!passwordValid) {
      return NextResponse.json(
        { ok: false, message: "Credenciales incorrectas." },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return NextResponse.json(
        { ok: false, message: "JWT_SECRET no configurado." },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "8h" }
    );

    const response = NextResponse.json({
      ok: true,
      message: "Login correcto.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);

    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}