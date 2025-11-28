import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { HashingService } from "@/iam/hashing/hashing.service";
import { SignupDto } from "./dto/signinup.dto";
import { SigninDto } from "./dto/signin.dto";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import _ from "lodash";
import { DurationType } from "@/common/schema/duration-schema";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import {
  AccessTokenPayloadSchema,
  RefreshTokenPayloadSchema,
  RefreshTokenPayload,
  ActiveUser,
} from "./dto/request-user.dto";
import { randomUUID, randomInt } from "node:crypto";
import { RefreshTokenIdsStorage } from "./refresh-token-ids.storage";
import { Prisma, PrismaService } from "@/prisma";
import { ErrorMessages } from "@/common/const";
import { ConfigService } from "@nestjs/config";
import { EnvVariables } from "@/common/schema/env";
import { SignoutDto } from "./dto/signout.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@Injectable()
export class AuthenticationService {
  JWT_TTL!: DurationType;
  JWT_REFRESH_TTL!: DurationType;
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingService,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(RefreshTokenIdsStorage)
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly config: ConfigService<EnvVariables>,
    private readonly mailerService: MailerService,
  ) {
    this.JWT_TTL = this.config.get("JWT_TTL", { infer: true })!;
    this.JWT_REFRESH_TTL = this.config.get("JWT_REFRESH_TTL", { infer: true })!;
  }

  async signUP(signupDto: SignupDto) {
    const { email, role, password: originalPassword } = signupDto;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException(ErrorMessages.EMAIL_ALREADY_EXIST);
    }
    const password = await this.hashingService.hash({ original: originalPassword });
    const verificationCode = randomInt(100000, 999999).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password,
          role,
          isVerified: false,
          verificationCode,
          verificationCodeExpiresAt
        },
        select: {
          id: true,
          email: true,
        },
      });
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome! Verify your Email',
        html: `
          <h1>Welcome to Medi-Care App</h1>
          <p>Your verification code is: <b>${verificationCode}</b></p>
          <p>This code expires in 15 minutes.</p>
        `,
      });
      return { message: "User created. Please check your email for verification code." };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientUnknownRequestError && e.code === "P2002") {
        throw new ConflictException(ErrorMessages.EMAIL_ALREADY_EXIST);
      }
      throw e;
    } 
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, code } = verifyEmailDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(ErrorMessages.USER_DOES_NOT_EXIST);
    }

    if (user.isVerified) {
      throw new BadRequestException("User is already verified");
    }

    if (user.verificationCode !== code) {
      throw new UnauthorizedException("Invalid verification code");
    }

    if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
      throw new UnauthorizedException("Verification code has expired");
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });
    const signedData = { sub: user.id, email: user.email, role: user.role };
    const generatedTokens = await this.generateTokens(signedData);
    await this.refreshTokenIdsStorage.insert(user.id, generatedTokens.refreshTokenId);
    return _.omit(generatedTokens, ["refreshTokenId"]);
  }

  async signIn(signInDto: SigninDto) {
    const { email } = signInDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        role: true,
        isVerified: true,
      },
    });
    if (user == undefined) {
      throw new UnauthorizedException(ErrorMessages.USER_DOES_NOT_EXIST);
    }
    if (!user.isVerified) {
      throw new UnauthorizedException("Please verify your email before logging in.");
    }
    const doesPasswordMatch = await this.hashingService.compare({
      original: signInDto.password,
      encrypted: user.password,
    });
    if (!doesPasswordMatch) {
      throw new UnauthorizedException(ErrorMessages.PASSWORD_INCORRECT);
    }
    const signedData = { sub: user.id, email: user.email, role: user.role };
    const generatedTokens = await this.generateTokens(signedData);
    await this.refreshTokenIdsStorage.insert(user.id, generatedTokens.refreshTokenId);
    return _.omit(generatedTokens, ["refreshTokenId"]);
  }

  async signout(signoutDto: SignoutDto) {
    const user = await this.jwtService.verifyAsync<RefreshTokenPayload>(signoutDto.refreshToken);
    const id = user.sub;
    const dbUser = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    const doesPasswordMatch = await this.hashingService.compare({
      original: signoutDto.password,
      encrypted: dbUser.password,
    });
    if (doesPasswordMatch) {
      await this.refreshTokenIdsStorage.invalidate(user.sub);
      return;
    } else {
      return new UnauthorizedException("Incorrect Password");
    }
  }
  async refreshTokens(refreshTokensDto: RefreshTokenDto) {
    const refreshTokenPayload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshTokensDto.refreshToken);

    const { refreshTokenId, sub } = refreshTokenPayload;
    const isValid = await this.refreshTokenIdsStorage.validate(sub, refreshTokenId);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    await this.refreshTokenIdsStorage.invalidate(sub);
    const user = await this.prisma.user.findUnique({
      where: {
        id: sub,
      },
    });
    if (user == undefined) {
      throw new UnauthorizedException("user not found");
    }
    const generatedTokens = await this.generateTokens(refreshTokenPayload);
    await this.refreshTokenIdsStorage.insert(sub, generatedTokens.refreshTokenId);
    return _.omit(generatedTokens, ["refreshTokenId"]);
  }
  public async generateTokens(payLoadDto: ActiveUser) {
    const refreshTokenPayload = RefreshTokenPayloadSchema.parse({
      ...payLoadDto,
      refreshTokenId: `userId=${payLoadDto.sub.toString()}.${randomUUID()}`,
    });
    const accessTokenPayload = AccessTokenPayloadSchema.parse({
      ...refreshTokenPayload,
      tokenType: "access",
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.signMethod(accessTokenPayload, this.JWT_TTL),
      this.signMethod(refreshTokenPayload, this.JWT_REFRESH_TTL),
    ]);

    return { accessToken, refreshToken, refreshTokenId: refreshTokenPayload.refreshTokenId };
  }
  private async signMethod<T extends ActiveUser>(signedData: T, expiresIn: DurationType) {
    return await this.jwtService.signAsync(signedData, {
      expiresIn,
    } satisfies JwtSignOptions);
  }
}
