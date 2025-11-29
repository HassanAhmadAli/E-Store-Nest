import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from "@nestjs/common";
import { ComplaintsService } from "./complaints.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";

import { type ActiveUserType, ActiveUser } from "@/iam/decorators/ActiveUser.decorator";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";

@Controller("complaints")
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post("raise")
  raiseComplaint(@Body() createComplaintDto: CreateComplaintDto, @ActiveUser("Citizen") activeUser: ActiveUserType) {
    const id = activeUser.sub;
    return this.complaintsService.raiseComplaint(createComplaintDto, id);
  }

  @Get("my-complaints")
  async getCitizenComplaints(@ActiveUser("Citizen") user: ActiveUserType) {
    const id = user.sub;
    return await this.complaintsService.getCitizenComplaints(id);
  }

  //todo: Receive/Process
  @Get("assigned")
  x() {
    return { message: "Receive/Process" };
  }

  //todo: Update Status
  @Patch(":id/status")
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateComplaintDto: UpdateComplaintDto,
    @ActiveUser("Employee") user: ActiveUserType,
  ) {
    const employeeId = user.sub;
    return await this.complaintsService.updateStatus(id, employeeId, updateComplaintDto);
  }

  //todo: Archive Complaint
  @Delete(":id/status")
  archiveComplaint(@Param("id", ParseIntPipe) _id: number) {
    return { message: "Archive Complaint" };
  }

  //todo: show and trace complaints for citizen
}
