import { Injectable } from "@nestjs/common";
import { HashingService } from "./hashing.service";
import argon2 from "argon2";
@Injectable()
export class Argon2Service implements HashingService {
  async hash(passwordInfo: { original: string }): Promise<string> {
    return await argon2.hash(passwordInfo.original);
  }
  async compare(passwordInfo: { original: string; encrypted: string }): Promise<boolean> {
    return await argon2.verify(passwordInfo.encrypted, passwordInfo.original);
  }
}
