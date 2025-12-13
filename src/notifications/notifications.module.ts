import { NotificationsController } from "./notifications.controller";
import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationsGateway } from "./notifications.gateway";
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
