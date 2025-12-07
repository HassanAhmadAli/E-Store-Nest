import { envSchema } from "@/common/schema/env";
import { Argon2Service } from "@/iam/hashing/argon2.service";
import { createPrismaClient, PrismaClientKnownRequestError, Role } from "@/prisma";
import { seedUsers } from "./user";

const env = envSchema
  .pick({
    DATABASE_URL: true,
  })
  .parse(process.env);

const prisma = createPrismaClient({
  DATABASE_URL: env.DATABASE_URL,
});

async function seed() {
  const hashingService = new Argon2Service();
  await seedUsers(hashingService, prisma);
}
async function bootstrap() {
  try {
    await seed();
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      console.log(e.message);
    }
    await prisma.$disconnect();

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
void bootstrap();
