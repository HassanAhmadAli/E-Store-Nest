import { Body, Controller, Patch } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { type ActiveUserType, ActiveUser } from "@/iam/decorators/ActiveUser.decorator";
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  //todo: Edit Account Data
  @Patch("profile")
  updateProfile(@Body() updateUserDto: UpdateProfileDto, @ActiveUser() activeUser: ActiveUserType) {
    const id = activeUser.sub;
    return this.userService.updateProfile(updateUserDto, id);
  }
}
