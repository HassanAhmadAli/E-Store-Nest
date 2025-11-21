import { ProductPermissions } from "@/product/product.permissions";

export const Permissions = {
  ...ProductPermissions,
} as const;
export type Permission = ValueOf<typeof Permissions>;
