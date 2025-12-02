import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { ActiveUserType } from "../authentication/dto/request-user.dto";
import { Keys } from "@/common/const";
export type { ActiveUserType } from "@/iam/authentication/dto/request-user.dto";
import express from "express";
import { Role } from "@/prisma";
export type RequestWithActiveUser = express.Request & { [Keys.User]: ActiveUserType };

export const ActiveUser = createParamDecorator((role: Role | Array<Role> | undefined, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<RequestWithActiveUser>();
  const user: ActiveUserType = req[Keys.User]!;
  if (role == undefined) {
    return user;
  }
  if (role === user.role) {
    return user;
  }
  if (Array.isArray(role) && role.includes(user.role)) {
    return user;
  }
  if (user.role === Role.Debugging) return user;
  throw new BadRequestException(`expected roles "${role.toString()}" , recieved "${user.role}"`);
});
