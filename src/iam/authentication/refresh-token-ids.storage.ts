import { Injectable } from "@nestjs/common";
import { RedisService } from "@/redis/redis.service";
@Injectable()
export class RefreshTokenIdsStorage {
  constructor(private readonly redisService: RedisService) {}

  async insert(userId: number, tokenId: string): Promise<void> {
    const key = this.getKey(userId);
    await this.redisService.client.set(key, tokenId);
  }
  async validate(userId: number, tokenId: string): Promise<boolean> {
    const key = this.getKey(userId);
    const storedId = await this.redisService.client.get(key);
    return storedId === tokenId;
  }
  async invalidate(userId: number): Promise<void> {
    const key = this.getKey(userId);
    await this.redisService.client.del(key);
  }
  getKey(userId: number): string {
    return `user-${userId}`;
  }
}
