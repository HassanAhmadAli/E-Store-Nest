import { Body, Controller, Patch, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { type ActiveUserType, ActiveUser } from "@/iam/decorators/ActiveUser.decorator";
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  //todo: Edit Account Data
  @Patch("profile")
  updateProfile(@Body() updateUserDto: UpdateProfileDto, @ActiveUser() { sub: id, role }: ActiveUserType) {
    if (role === "Employee") {
      throw new UnauthorizedException("Employees can not directly modify theire profiles");
    }
    return this.userService.updateProfile(updateUserDto, id);
  }
}
