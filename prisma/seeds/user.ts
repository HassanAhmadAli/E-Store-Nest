import { HashingService } from "@/iam/hashing/hashing.service";
import { PrismaClient, Role } from "@/prisma";
import { getKeyOf } from "@/utils";

export const data = {
  Admin: {
    id: 1,
    email: "admin.user@example.com",
    fullName: "Maria Fritz",
    phoneNumber: "0900000001",
    nationalId: "0000000001",
    role: Role.Admin,
    password: "12345678",
  },
  Citizen: {
    id: 2,
    email: "citizen.user@example.com",
    fullName: "Rose Fritz",
    phoneNumber: "0900000002",
    nationalId: "0000000002",
    role: Role.Citizen,
    password: "12345678",
  },
  Debugging: {
    id: 3,
    email: "debug.user@example.com",
    fullName: "Ymir Fritz",
    phoneNumber: "0900000003",
    nationalId: "0000000003",
    role: Role.Debugging,
    password: "12345678",
  },
  Employee: {
    id: 4,
    email: "employee.user@example.com",
    fullName: "Sina Fritz",
    phoneNumber: "0900000004",
    nationalId: "0000000004",
    role: Role.Employee,
    password: "12345678",
  },
};

export async function seedUsers(hashingService: HashingService, prisma: PrismaClient) {
  for (const key of getKeyOf(data)) {
    const userData = data[key];
    const password = await hashingService.hash({
      original: userData.password,
    });
    await prisma.user.create({
      data: {
        ...userData,
        password,
        isVerified: true,
      },
    });
  }
}
