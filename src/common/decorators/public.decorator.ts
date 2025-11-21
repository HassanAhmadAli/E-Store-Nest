import { SetMetadata } from "@nestjs/common";
import { Keys, AuthTypes } from "@/common/const";
export const Auth = (authType: AuthTypes) => SetMetadata(Keys.Auth, authType);
export const Public = () => Auth(AuthTypes.NONE);
export const Private = () => Auth(AuthTypes.BEARER);
