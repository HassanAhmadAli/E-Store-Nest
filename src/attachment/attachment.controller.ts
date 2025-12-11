import { UploadedFile, UseInterceptors, Controller, Get, Post, Body, Patch, Param, Delete, Req } from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { CreateAttachmentDto } from "./dto/create-attachment.dto";
import { UpdateAttachmentDto } from "./dto/update-attachment.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import z from "zod";

@Controller("attachment")
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}
  @Post("file")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const x = z.file().parse(file);
    return file;
  }

  @Post()
  create(@Body() createAttachmentDto: CreateAttachmentDto) {
    return this.attachmentService.create(createAttachmentDto);
  }

  @Get()
  findAll() {
    return this.attachmentService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.attachmentService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAttachmentDto: UpdateAttachmentDto) {
    return this.attachmentService.update(+id, updateAttachmentDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.attachmentService.remove(+id);
  }
}
