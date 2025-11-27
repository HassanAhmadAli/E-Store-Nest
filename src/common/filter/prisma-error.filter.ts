import { pino } from "@/logger/pino";
import { ArgumentsHost, BadRequestException, Catch, ConflictException, NotFoundException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { PrismaClientKnownRequestError } from "@/prisma";

@Catch(PrismaClientKnownRequestError)
export class PrismaServerErrorFilter extends BaseExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case "P2002": {
        const target = (exception.meta?.target as string) || "resource";
        return super.catch(new ConflictException(`Unique constraint failed on the field: ${target}`), host);
      }
      case "P2003": {
        const fieldName = (exception.meta?.field_name as string) || "relation";
        return super.catch(new BadRequestException(`Foreign key constraint failed on field: ${fieldName}`), host);
      }
      case "P2006": {
        const invalidField = (exception.meta?.field_name as string) || "a field";
        return super.catch(new BadRequestException(`Invalid data provided for field: ${invalidField}`), host);
      }
      case "P2011": {
        const constraint = (exception.meta?.constraint as string) || "a required field";
        return super.catch(new BadRequestException(`Missing required value for ${constraint}.`), host);
      }
      case "P2014": {
        return super.catch(new BadRequestException("The requested change violates a required relation."), host);
      }
      case "P2025": {
        const cause = exception.meta?.cause || "Record not found";
        return super.catch(new NotFoundException(cause), host);
      }
      default: {
        pino.error({ prismaException: exception });
        return super.catch(new BadRequestException(`Prisma Validation Error`), host);
      }
    }
  }
}
