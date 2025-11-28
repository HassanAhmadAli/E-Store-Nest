import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { SigninDto } from "./dto/signin.dto";
import { SignupDto } from "./dto/signinup.dto";
import { AuthenticationService } from "./authentication.service";
import { Public } from "@/common/decorators/public.decorator";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SignoutDto } from "./dto/signout.dto";
@Public()
@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}
  @HttpCode(HttpStatus.OK)
  @Post("signin")
  async signin(@Body() signinDto: SigninDto) {
    const { accessToken, refreshToken } = await this.authenticationService.signIn(signinDto);
    return { accessToken, refreshToken };
  }
  @Post("signup")
  async signup(@Body() signUpDto: SignupDto) {
    const user = await this.authenticationService.signup(signUpDto);
    return user;
  }
  @HttpCode(HttpStatus.OK)
  @Post("refresh-tokens")
  refreshTokens(@Body() refreshTokensDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokensDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post("signout")
  signout(@Body() signoutDto: SignoutDto) {
    return this.authenticationService.signout(signoutDto);
  }
}
