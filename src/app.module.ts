import { ZodValidationPipe, ZodSerializerInterceptor } from "nestjs-zod";
import { APP_PIPE, APP_INTERCEPTOR } from "@nestjs/core";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EnvVariables, validateEnv } from "@/common/schema/env";
import { CommonModule } from "@/common/common.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { TimeoutInterceptor } from "@/common/interceptors/timeout.interceptor";
import { IdentityAndAccessManagementModule } from "@/iam/iam.module";
import { DevtoolsModule } from "@nestjs/devtools-integration";
import { CacheModule } from "@nestjs/cache-manager";
import { UserModule } from "./user/user.module";
import { ComplaintsModule } from "./complaints/complaints.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { StatisticsModule } from "./statistics/statistics.module";
import KeyvRedis from "@keyv/redis";
import morgan from "morgan";
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
    IdentityAndAccessManagementModule,
    UserModule,
    ComplaintsModule,
    NotificationsModule,
    StatisticsModule,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(morgan("dev")).forRoutes("*");
  }
}
