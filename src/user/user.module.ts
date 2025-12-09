import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { IdentityAndAccessManagementModule } from "@/iam/iam.module";

@Module({
  imports: [IdentityAndAccessManagementModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
