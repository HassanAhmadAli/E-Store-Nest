import { HashingService } from "@/iam/hashing/hashing.service";
import { PrismaClient, Role } from "@/prisma";
export const debuggingUser = {
  email: `${Role.Debugging}.user@example.com`,
  fullName: `${Role.Debugging}`,
  phoneNumber: "0987654321",
  nationalId: "1234567890",
  role: Role.Debugging,
};

export async function seedUsers(hashingService: HashingService, prisma: PrismaClient) {
  const password = await hashingService.hash({
    original: "12345678",
  });
  const current = await prisma.user.findFirst({
    where: {
      OR: [{ nationalId: debuggingUser.nationalId }, { email: debuggingUser.email }],
    },
  });
  const inserted = await prisma.user.upsert({
    where: {
      email: current?.email || debuggingUser.email,
    },
    update: {
      ...debuggingUser,
      password,
    },
    create: {
      ...debuggingUser,
      password,
    },
  });
  console.log({ debuggingUser: inserted });
}
