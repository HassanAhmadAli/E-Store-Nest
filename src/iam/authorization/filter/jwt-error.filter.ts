import { ErrorMessages } from "@/common/const";
import { ArgumentsHost, Catch, UnauthorizedException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { JsonWebTokenError } from "@nestjs/jwt";

@Catch(JsonWebTokenError)
export class JwtErrorFilter extends BaseExceptionFilter {
  e: Error = new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
  override catch(_exception: JsonWebTokenError, host: ArgumentsHost) {
    super.catch(this.e, host);
  }
}
