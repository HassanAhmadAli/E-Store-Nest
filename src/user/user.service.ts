import { Injectable } from "@nestjs/common";
import { Prisma, PrismaService } from "@/prisma";
import { Public } from "@/common/decorators/public.decorator";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { getKeysOfTrue } from "@/common/utils";

@Public()
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async updateProfile(updateUserDto: UpdateProfileDto, userId: number) {
    const user = await this.prismaService.client.user.update({
      where: {
        deletedAt: null,
        id: userId,
      },
      data: updateUserDto,
      select: {
        ...getKeysOfTrue(updateUserDto),
        email: true,
      } satisfies Prisma.UserSelect,
    });
    return user;
  }
}
