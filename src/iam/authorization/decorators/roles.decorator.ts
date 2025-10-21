import { Keys, Role } from "@/common/const";
import { SetMetadata } from "@nestjs/common";

export const Roles = (...args: Role[]) => SetMetadata(Keys.Roles, args);
