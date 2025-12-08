import { HashingService } from "@/iam/hashing/hashing.service";
import { PrismaService } from "@/prisma";
import { CreateEmployeeDto } from "@/user/dto/create-user.dto";
import { ConflictException, Injectable } from "@nestjs/common";
import _ from "lodash";

@Injectable()
export class StatisticsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}
  async addEmployee(createEmployeeDto: CreateEmployeeDto) {
    const password = await this.hashingService.hash({ raw: createEmployeeDto.password });
    const user = await this.prismaService.client.user.create({
      data: {
        ..._.omit(createEmployeeDto, ["password"]),
        password,
        isVerified: true,
      },
      select: {
        email: true,
        role: true,
        fullName: true,
        createdAt: true,
        phoneNumber: true,
      },
    });
    return user;
  }

  //todo: Promote to Admin
  async promoteToAdmin(employeeId: number) {
    const employee = await this.prismaService.client.user.findUnique({
      where: {
        id: employeeId,
      },
      select: {
        email: true,
        role: true,
      },
    });
    if (employee == undefined) {
      throw new ConflictException("User Not Found");
    }
    return employee;
  }

  //todo: Delete Account
  async deleteAccount(userId: number, _adminId: number) {
    return await this.prismaService.client.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId, deletedAt: null } });
      if (user == undefined) {
        throw new ConflictException("User Not Found");
      }
      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    });
  }
}
