import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { ComplaintsService } from "./complaints.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { type ActiveUser, GetActiveUser } from "@/iam/decorators/ActiveUser.decorator";

@Controller("complaints")
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  create(@Body() createComplaintDto: CreateComplaintDto, @GetActiveUser() activeUser: ActiveUser) {
    return this.complaintsService.create(createComplaintDto, activeUser.sub);
  }

  @Get()
  findAll() {
    return this.complaintsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.complaintsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateComplaintDto: UpdateComplaintDto) {
    return this.complaintsService.update(+id, updateComplaintDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.complaintsService.remove(+id);
  }
}
