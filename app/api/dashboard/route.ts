import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-server";

export async function GET() {
  try {
    await requireAuth();

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      supervisorUsers,
      operatorUsers,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          active: true,
        },
      }),
      prisma.user.count({
        where: {
          active: false,
        },
      }),
      prisma.user.count({
        where: {
          role: "ADMIN",
        },
      }),
      prisma.user.count({
        where: {
          role: "SUPERVISOR",
        },
      }),
      prisma.user.count({
        where: {
          role: "OPERADOR",
        },
      }),
      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        supervisorUsers,
        operatorUsers,
      },
      recentUsers,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          ok: false,
          message: "No autenticado.",
        },
        { status: 401 }
      );
    }

    console.error("Error cargando dashboard:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}