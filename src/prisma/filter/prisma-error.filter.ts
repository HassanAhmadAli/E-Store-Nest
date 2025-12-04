import { pino } from "@/logger/pino";
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { PrismaClientKnownRequestError } from "@/prisma";

@Catch(PrismaClientKnownRequestError)
export class PrismaServerErrorFilter extends BaseExceptionFilter {
  override catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    switch (exception.code) {
      case "P2002": {
        const meta = exception.meta as { driverAdapterError?: { cause?: { originalMessage?: string } } };
        const message = meta?.driverAdapterError?.cause?.originalMessage || "Unique constraint failed ";
        pino.debug({ "db-unique-constraint-failed": message });
        return super.catch(new ConflictException(message), host);
      }
      case "P2003": {
        const fieldName = (exception.meta?.field_name as string) || "relation";
        return super.catch(new BadRequestException(`Foreign key constraint failed on the field: ${fieldName}`), host);
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
      case "P2022": {
        pino.error({ prismaException: exception.message });
        return super.catch(new InternalServerErrorException(`column does not exist in the current database`), host);
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
