import { Keys } from "@/common/const";
import { SetMetadata } from "@nestjs/common";
import { Role } from "@/prisma";
export const SetRoles = (...args: Role[]) => SetMetadata(Keys.Roles, args);
