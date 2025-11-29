import { Body, Controller, Patch } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { type ActiveUserType, ActiveUser } from "@/iam/decorators/ActiveUser.decorator";
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  //todo: Edit Account Data
  @Patch("profile")
  editAccount(@Body() updateUserDto: UpdateUserDto, @ActiveUser() activeUser: ActiveUserType) {
    const id = activeUser.sub;
    return this.userService.editAccount(updateUserDto, id);
  }
}
