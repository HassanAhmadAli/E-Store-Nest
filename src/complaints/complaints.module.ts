import { Module } from "@nestjs/common";
import { ComplaintsService } from "./complaints.service";
import { ComplaintsController } from "./complaints.controller";
import { CommonModule } from "@/common/common.module";

@Module({
  imports: [CommonModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
})
export class ComplaintsModule {}
