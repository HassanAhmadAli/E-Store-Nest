import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { ActiveUser } from "../authentication/dto/request-user.dto";
import { Keys } from "@/common/const";
export type { ActiveUser as ActiveUser } from "@/iam/authentication/dto/request-user.dto";
import express from "express";
export type RequestWithActiveUser = express.Request & { [Keys.User]: ActiveUser };
export const GetActiveUser = createParamDecorator((_: never, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<RequestWithActiveUser>();
  const user: ActiveUser = req[Keys.User];
  return user;
});
