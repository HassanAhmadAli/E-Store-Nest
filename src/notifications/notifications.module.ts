import { NotificationsController } from "./notifications.controller";
import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsGateway } from "./notifications.gateway";
import { BullModule } from "@nestjs/bullmq";
import { env } from "@/common/env";
import { Keys } from "@/common/const";
import { IdentityAndAccessManagementModule } from "@/iam/iam.module";
import { CommonModule } from "@/common/common.module";
import { NotificationConsumer } from "./notification.consumer";

@Module({
  imports: [
    CommonModule,
    IdentityAndAccessManagementModule,
    BullModule.registerQueue({
      name: Keys.notification,
      connection: {
        url: env!.REDIS_DATABASE_URL,
      },
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService, NotificationConsumer],
  exports: [NotificationsGateway, NotificationsService, NotificationConsumer, BullModule],
})
export class NotificationsModule {}
