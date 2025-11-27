import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Permissions } from "../permission.type";
import { Keys } from "@/common/const";
import { RequestWithActiveUser } from "@/iam/decorators/ActiveUser.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<Permissions>(Keys.Permissions, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (contextPermissions == undefined) {
      return true;
    }
    const _user = context.switchToHttp().getRequest<RequestWithActiveUser>()[Keys.User];
    //todo: implement
    return true;
  }
}
