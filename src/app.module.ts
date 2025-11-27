import { ZodValidationPipe, ZodSerializerInterceptor } from "nestjs-zod";
import { APP_PIPE, APP_INTERCEPTOR } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EnvVariables, validateEnv } from "@/common/schema/env";
import { CommonModule } from "@/common/common.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { ProductModule } from "@/product/product.module";
import { TimeoutInterceptor } from "@/common/interceptors/timeout.interceptor";
import { IdentityAndAccessManagementModule } from "@/iam/iam.module";
import { DevtoolsModule } from "@nestjs/devtools-integration";
import { CacheModule } from "@nestjs/cache-manager";
import { NotificationsModule } from './notifications/notifications.module';
import KeyvRedis from "@keyv/redis";
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvVariables>) => ({
        ttl: 5 * 1000,
        stores: [new KeyvRedis(configService.getOrThrow("REDIS_DATABASE_URL", { infer: true }), {})],
      }),
    }),
    DevtoolsModule.register({
      http: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => {
          return validateEnv(process.env);
        },
      ],
      validate: validateEnv,
    }),
    CommonModule,
    PrismaModule,
    ProductModule,
    IdentityAndAccessManagementModule,
    NotificationsModule,
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
