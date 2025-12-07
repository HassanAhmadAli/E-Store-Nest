import { pino } from "@/logger/pino";
import {
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@/prisma";

@Catch(PrismaClientKnownRequestError)
export class PrismaServerErrorFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError) {
    switch (exception.code) {
      case "P2002": {
        const meta = exception.meta as { driverAdapterError?: { cause?: { originalMessage?: string } } };
        const message = meta?.driverAdapterError?.cause?.originalMessage || "Unique constraint failed ";
        pino.debug({ "db-unique-constraint-failed": message });
        throw new ConflictException(message);
      }
      case "P2003": {
        const fieldName = (exception.meta?.field_name as string) || "relation";
        throw new BadRequestException(`Foreign key constraint failed on the field: ${fieldName}`);
      }
      case "P2006": {
        const invalidField = (exception.meta?.field_name as string) || "a field";
        throw new BadRequestException(`Invalid data provided for field: ${invalidField}`);
      }
      case "P2011": {
        const constraint = (exception.meta?.constraint as string) || "a required field";
        throw new BadRequestException(`Missing required value for ${constraint}.`);
      }
      case "P2014": {
        throw new BadRequestException("The requested change violates a required relation.");
      }
      case "P2022": {
        pino.error({ prismaException: exception.message });
        throw new InternalServerErrorException(`column does not exist in the current database`);
      }
      case "P2025": {
        const cause = exception.meta?.cause || "Record not found";
        throw new NotFoundException(cause);
      }
      default: {
        pino.error({ prismaException: exception });
        throw new BadRequestException(`Prisma Validation Error`);
      }
    }
  }
}
