import { envSchema } from "@/common/schema/env";
import { Argon2Service } from "@/iam/hashing/argon2.service";
import { PrismaClient, PrismaClientKnownRequestError } from "@/prisma";
import { seedUsers } from "./user";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDepartments } from "./department";
import { seedComplaints } from "./complaints";
import { logger } from "@/utils";

const { DATABASE_URL } = envSchema
  .pick({
    DATABASE_URL: true,
  })
  .parse(process.env);

const adapter = new PrismaPg({
  connectionString: DATABASE_URL,
  max: 20,
});
const prisma = new PrismaClient({ adapter });

async function seed() {
  const hashingService = new Argon2Service();
  await seedUsers(hashingService, prisma);
  await seedDepartments(prisma);
  await seedComplaints(prisma);
}

async function bootstrap() {
  try {
    await seed();
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      logger.error({ caller: "PrismaClientKnownRequestError", value: e.message });
    }
    await prisma.$disconnect();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
void bootstrap();
