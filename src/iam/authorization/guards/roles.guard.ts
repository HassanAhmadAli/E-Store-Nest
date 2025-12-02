import { Keys } from "@/common/const";
import { RequestWithActiveUser } from "@/iam/decorators/ActiveUser.decorator";
import { PrismaService } from "@/prisma";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@/prisma";
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<Role[]>(Keys.Permissions, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (allowedRoles == undefined) {
      return true;
    }
    const req: RequestWithActiveUser = context.switchToHttp().getRequest<RequestWithActiveUser>();
    const user = req[Keys.User]!;
    const x = await this.prisma.client.user.findUniqueOrThrow({
      where: {
        id: user.sub,
      },
    });
    return allowedRoles.includes(x.role);
  }
}
