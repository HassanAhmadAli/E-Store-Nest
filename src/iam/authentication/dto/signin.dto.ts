import { createZodDto } from "nestjs-zod";
import { SingupSchema } from "./signinup.dto";
export const SigninSchema = SingupSchema.pick({
  email: true,
  password: true,
});
export class SigninDto extends createZodDto(SigninSchema) {}
