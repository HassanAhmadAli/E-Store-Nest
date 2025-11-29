import { Controller, Patch } from "@nestjs/common";
import { UserService } from "./user.service";
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  //todo: edit user profile
  @Patch("profile")
  editAccount() {
    return { msg: "Edit Account Data" };
  }
}
