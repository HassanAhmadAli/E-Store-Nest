import { NotificationsController } from "./notifications.controller";
import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsGateway } from "./notifications.gateway";
import { BullModule } from "@nestjs/bullmq";
import { env } from "@/common/env";
import { Keys } from "@/common/const";
@Module({
  imports: [
    BullModule.registerQueue({
      name: Keys.notification,
      connection: {
        url: env!.REDIS_DATABASE_URL,
      },
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
