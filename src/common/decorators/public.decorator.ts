import { SetMetadata } from "@nestjs/common";
import { Keys, AuthType, AuthTypes } from "@/common/const";
export const Auth = (authType: AuthType) => SetMetadata(Keys.Auth, authType);
export const Public = () => Auth(AuthTypes.NONE);
export const Private = () => Auth(AuthTypes.BEARER);
