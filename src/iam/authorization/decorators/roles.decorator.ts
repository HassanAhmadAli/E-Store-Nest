import { Keys } from "@/common/const";
import { SetMetadata } from "@nestjs/common";
import { Roles } from "@/prisma";
export const SetRoles = (...args: Roles[]) => SetMetadata(Keys.Roles, args);
