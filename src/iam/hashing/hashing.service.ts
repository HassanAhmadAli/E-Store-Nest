import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class HashingService {
  abstract hash(passwordInfo: { original: string }): Promise<string>;
  abstract compare(passwordInfo: { original: string; encrypted: string }): Promise<boolean>;
}
