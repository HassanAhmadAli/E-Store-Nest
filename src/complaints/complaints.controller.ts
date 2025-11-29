import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from "@nestjs/common";
import { ComplaintsService } from "./complaints.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";

import { type ActiveUser, GetActiveUser } from "@/iam/decorators/ActiveUser.decorator";

@Controller("complaints")
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  //todo: Raise Complaint
  @Post()
  raiseComplaint(@Body() createComplaintDto: CreateComplaintDto, @GetActiveUser() activeUser: ActiveUser) {
    return this.complaintsService.create(createComplaintDto, activeUser.sub);
  }

  //todo: View/Track Status
  @Get("my-complaints")
  myComplaints() {
    return { msg: "	View/Track Status" };
  }

  //todo: Receive/Process
  @Get("assigned")
  x() {
    return { msg: "Receive/Process" };
  }

  //todo: Update Status
  @Patch(":id/status")
  updateStatus(@Param("id", ParseIntPipe) _id: number) {
    return { msg: "Update Status" };
  }

  //todo: Archive Complaint
  @Delete(":id/status")
  archiveComplaint(@Param("id", ParseIntPipe) _id: number) {
    return { msg: "Archive Complaint" };
  }

  //todo: show and trace complaints for citizen
}
