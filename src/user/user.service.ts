import { Injectable } from "@nestjs/common";
import { Prisma, PrismaService } from "@/prisma";
import { Public } from "@/common/decorators/public.decorator";
import _ from "lodash";
import { UpdateUserDto } from "./dto/update-user.dto";
import { getKeysOfTrue } from "@/common/utils";

@Public()
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async editAccount(updateUserDto: UpdateUserDto, userId: number) {
    const user = await this.prismaService.client.user.update({
      where: {
        id: userId,
      },
      data: updateUserDto,
      select: {
        ...getKeysOfTrue(updateUserDto),
        email: true,
        id: true,
      } satisfies Prisma.UserSelect,
    });
    return user;
  }
}
