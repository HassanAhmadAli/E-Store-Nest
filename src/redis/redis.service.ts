import { EnvVariables } from "@/common/schema/env";
import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
@Injectable()
export class RedisService implements OnApplicationBootstrap, OnApplicationShutdown {
  public client!: Redis;
  constructor(private readonly config: ConfigService<EnvVariables>) {}
  onApplicationBootstrap() {
    this.client = new Redis({
      host: this.config.get("REDIS_DATABASE_HOST", { infer: true }),
      port: this.config.get("REDIS_DATABASE_PORT", { infer: true }),
    });
  }
  async onApplicationShutdown(_signal?: string) {
    await this.client.quit();
  }
}
