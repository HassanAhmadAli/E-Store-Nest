import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";
import { IdentityAndAccessManagementModule } from "@/iam/iam.module";
@Module({
  imports: [IdentityAndAccessManagementModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
