import { Injectable } from "@nestjs/common";
import { Prisma, PrismaService, Role } from "@/prisma";
import { Public } from "@/common/decorators/public.decorator";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { getKeysOfTrue } from "@/utils";
import { HashingService } from "@/iam/hashing/hashing.service";
import { CreateEmployeeDto } from "./dto/create-user.dto";

@Public()
@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}
  get prisma() {
    return this.prismaService.client;
  }
  async updateAdminProfile(updateUserDto: UpdateProfileDto, userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
        role: {
          in: [Role.Employee, Role.Debugging],
        },
      },
      data: updateUserDto,
      select: {
        ...getKeysOfTrue(updateUserDto),
        email: true,
      } satisfies Prisma.UserSelect,
    });
  }

  async updateEmployeeProfile(updateUserDto: UpdateProfileDto, userId: number) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
        role: {
          in: [Role.Employee, Role.Debugging],
        },
      },
      data: updateUserDto,
      select: {
        ...getKeysOfTrue(updateUserDto),
        email: true,
      } satisfies Prisma.UserSelect,
    });
    return user;
  }
  async addEmployee({ password: rawPassword, ...createEcmployeeDto }: CreateEmployeeDto) {
    const password = await this.hashingService.hash({ raw: rawPassword });
    return await this.prisma.user.create({
      data: {
        ...createEcmployeeDto,
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
  }

  //todo: Promote to Admin
  async promoteToAdmin(employeeId: number) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        id: employeeId,
      },
      select: {
        email: true,
        role: true,
      },
    });
  }

  async archiveAccount(userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
  async deleteAccount(userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
