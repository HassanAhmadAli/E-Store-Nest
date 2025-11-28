import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { EnvVariables } from "@/common/schema/env";
import { RefreshTokenIdsStorage } from "./authentication/refresh-token-ids.storage";
import { AccessTokenGuard } from "./authentication/guard/access-token.guard";
import { HashingService } from "./hashing/hashing.service";
import { Argon2Service } from "./hashing/argon2.service";
import { AuthenticationController } from "./authentication/authentication.controller";
import { AuthenticationService } from "./authentication/authentication.service";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { AuthenticationGuard } from "./authentication/guard/authentication.guard";
import { JwtErrorFilter } from "./authorization/filter/jwt-error.filter";
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    RefreshTokenIdsStorage,
    AccessTokenGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: HashingService,
      useClass: Argon2Service,
    },
    {
      provide: APP_FILTER,
      useClass: JwtErrorFilter,
    },
  ],
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', 
        auth: {
          user: 'saleemshalabi90@gmail.com',
          pass: 'iuavnyretzepsvev', // specific app password, not email password
        },
      },
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvVariables>) => {
        return {
          secret: config.get("JWT_SECRET", { infer: true }),
          signOptions: {
            audience: config.get("JWT_AUDIENCE", { infer: true }),
            issuer: config.get("JWT_ISSUER", { infer: true }),
            expiresIn: config.get("JWT_TTL", { infer: true }),
          },
          verifyOptions: {
            audience: config.get("JWT_AUDIENCE", { infer: true }),
            issuer: config.get("JWT_ISSUER", { infer: true }),
          },
        };
      },
    }),
  ],
})
export class IdentityAndAccessManagementModule {}
