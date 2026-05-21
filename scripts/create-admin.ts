import argon2 from "argon2";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "admin@sistema.com";
  const password = "123456";

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("El usuario admin ya existe.");
    return;
  }

  await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });

  console.log("Usuario admin creado correctamente.");
  console.log("Email:", email);
  console.log("Password:", password);
}

main()
  .catch((error) => {
    console.error("Error creando admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });