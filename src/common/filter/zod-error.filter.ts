import { BaseExceptionFilter } from "@nestjs/core";
import { prettifyError, ZodError } from "zod";
import { ArgumentsHost, Catch, BadRequestException } from "@nestjs/common";
@Catch(ZodError)
export class ZodErrorFilter extends BaseExceptionFilter {
  override catch(exception: ZodError, host: ArgumentsHost) {
    const error = new BadRequestException(prettifyError(exception));
    return super.catch(error, host);
  }
}
