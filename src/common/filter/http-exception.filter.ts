import { ArgumentsHost, BadRequestException, Catch, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { ZodSerializationException, ZodValidationException } from "nestjs-zod";
import { prettifyError, ZodError } from "zod";

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  override catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException || exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      if (zodError instanceof ZodError) {
        const e = new BadRequestException(prettifyError(zodError));
        return super.catch(e, host);
      }
    }
    super.catch(exception, host);
  }
}
