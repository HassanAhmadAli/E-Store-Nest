import { Module } from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { AttachmentController } from "./attachment.controller";
import { MulterModule } from "@nestjs/platform-express";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
@Module({
  imports: [
    MulterModule.register({
      dest: "./uploads",
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
    }),
  ],
  controllers: [AttachmentController],
  providers: [AttachmentService],
})
export class AttachmentModule {}
