import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AccessTokenGuard } from "./access-token.guard";
import { AuthTypes, Keys } from "@/common/const";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly defaultAuthType = AuthTypes.BEARER;

  constructor(
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authType =
      this.reflector.getAllAndOverride<AuthTypes>(Keys.Auth, [context.getHandler(), context.getClass()]) ||
      this.defaultAuthType;
    switch (authType) {
      case AuthTypes.NONE:
        return true;
      case AuthTypes.BEARER:
        return this.accessTokenGuard.canActivate(context);
    }
  }
}
