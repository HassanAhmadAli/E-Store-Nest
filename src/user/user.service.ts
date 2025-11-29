import { Injectable } from "@nestjs/common";
import { Prisma, PrismaService } from "@/prisma";
import { Public } from "@/common/decorators/public.decorator";
import _ from "lodash";
import { UpdateUserDto } from "./dto/update-user.dto";
import { getKeyOf } from "@/common/utils";

@Public()
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async editAccount(updateUserDto: UpdateUserDto, id: number) {
    const keys = getKeyOf(updateUserDto);
    const select: Prisma.UserSelect = { email: true, id: true };
    for (const key of keys) {
      select[key] = true;
    }
    const user = await this.prismaService.client.user.update({
      where: {
        id: id,
      },
      data: updateUserDto,
      select,
    });
    return user;
  }
}
