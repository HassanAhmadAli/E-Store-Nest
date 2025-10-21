import { ZodValidationPipe, ZodSerializerInterceptor } from "nestjs-zod";
import { APP_PIPE, APP_INTERCEPTOR } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "@/common/schema/env";
import { envFilePath } from "@/common/const";
import { CommonModule } from "@/common/common.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { RedisModule } from "@/redis/redis.module";
import { ProductModule } from "@/product/product.module";
import { TimeoutInterceptor } from "@/common/interceptors/timeout.interceptor";
import { IdentityAndAccessManagementModule } from "@/iam/iam.module";
import { FibModule } from './fib/fib.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePath,
      load: [
        () => {
          return validateEnv(process.env);
        },
      ],
      validate: validateEnv,
    }),
    CommonModule,
    PrismaModule,
    RedisModule,
    ProductModule,
    IdentityAndAccessManagementModule,
    FibModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
