import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma";
import { Public } from "@/common/decorators/public.decorator";
import _ from "lodash";

@Public()
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
}
