import { ProductPermissions } from "@/product/product.permissions";

export const Permissions = {
  ...ProductPermissions,
} as const;
type t = typeof Permissions;
export type Permission = t[keyof t];
