import { Global, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import morgan from "morgan";
import { ZodErrorFilter } from "./filter/zod-error";
import { HttpExceptionFilter } from "./filter/http-exception.filter";
import { PrismaServerErrorFilter } from "./filter/prisma-error.filter";
@Global()
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ZodErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaServerErrorFilter,
    },
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(morgan("dev")).forRoutes("*");
  }
}
