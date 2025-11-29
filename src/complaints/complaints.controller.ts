import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from "@nestjs/common";
import { ComplaintsService } from "./complaints.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";

import { type ActiveUser, GetActiveUser } from "@/iam/decorators/ActiveUser.decorator";

@Controller("complaints")
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) { }

  @Post()
  raiseComplaint(@Body() createComplaintDto: CreateComplaintDto, @GetActiveUser() activeUser: ActiveUser) {
    return this.complaintsService.create(createComplaintDto, activeUser.sub);
  }
  //todo: View/Track Status
  @Get("my-complaints")
  myComplaints() {
    return { msg: "my-complaints" }
  }
  @Get("assigned")
  x() {
    return { msg: "Receive/Process" }
  }
  @Patch(":id/status")
  y(@Param("id", ParseIntPipe) _id: number) {
    return { msg: "Update Status" }
  }
  @Delete(":id/status")
  z(@Param("id", ParseIntPipe) _id: number) {
    return { msg: "Archive Complaint" }
  }
  //todo: show and trace complaints for citizen
  //todo: show and trace complaints for citizen

}
