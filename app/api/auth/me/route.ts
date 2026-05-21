import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

type TokenPayload = JwtPayload & {
  sub: string;
  email: string;
  role: string;
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "No autenticado." },
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

    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded === "string") {
      return NextResponse.json(
        { ok: false, message: "Token inválido." },
        { status: 401 }
      );
    }

    const payload = decoded as TokenPayload;

    const userId = Number(payload.sub);

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Token inválido." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    if (!user || !user.active) {
      return NextResponse.json(
        { ok: false, message: "Usuario no válido." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Sesión inválida." },
      { status: 401 }
    );
  }
}