import { SetMetadata } from "@nestjs/common";
import { Permission } from "../permission.type";
import { Keys } from "@/common/const";
export const Permissions = (...args: Permission[]) => SetMetadata(Keys.Permissions, args);
