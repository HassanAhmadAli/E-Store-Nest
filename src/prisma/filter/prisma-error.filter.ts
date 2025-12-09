import {
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@/prisma";
import { logger } from "@/utils";

@Catch(PrismaClientKnownRequestError)
export class PrismaServerErrorFilter implements ExceptionFilter {
  catch(
    exception: PrismaClientKnownRequestError & {
      meta: { driverAdapterError?: { cause?: { originalMessage?: string } } };
    },
  ) {
    const originalMessage = exception.meta.driverAdapterError?.cause?.originalMessage;
    switch (exception.code) {
      case "P2002": {
        throw new ConflictException(originalMessage || "Database Unique Constraint Failed");
      }
      case "P2003": {
        throw new BadRequestException(originalMessage || "Foreign key constraint Failed");
      }
      case "P2006": {
        throw new BadRequestException(originalMessage || "Invalid data provided for Field");
      }
      case "P2011": {
        throw new BadRequestException(originalMessage || "Missing required value");
      }
      case "P2014": {
        throw new BadRequestException(originalMessage || "The requested change violates a required relation.");
      }
      case "P2022": {
        throw new InternalServerErrorException(originalMessage || "column does not exist in the current database");
      }
      case "P2025": {
        throw new NotFoundException(originalMessage || "Record not found");
      }
      default: {
        logger.error({
          caller: "PrismaServerErrorFilter",
          message: "unknown Exception",
          value: exception,
        });
        throw new BadRequestException(originalMessage || `Prisma Validation Error`);
      }
    }
  }
}
