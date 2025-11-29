import "@/common/env";
import { z } from "zod/v4";
import { Role } from "@/prisma";
import _ from "lodash";
import { InternalServerErrorException } from "@nestjs/common";

export const CreateUserSchema = z.object({
  fullName: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
  password: z.string(),
  nationalId: z.string(),
  role: z.enum(_.omit(Role, ["Employee"])).transform((role) => {
    if (role === "Debugging" && process.env.NODE_ENV !== "development") {
      throw new InternalServerErrorException("using illegal role");
    }
    return role;
  }),
});
