import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from "@nestjs/common";
import { ComplaintsService } from "./complaints.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";

import { ActiveUser } from "@/iam/decorators/ActiveUser.decorator";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { SetAllowedRoles } from "@/iam/authorization/decorators/roles.decorator";
import { Role } from "@/prisma";

@Controller("complaints")
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @SetAllowedRoles(Role.Citizen)
  @Post("raise")
  raiseComplaint(@Body() createComplaintDto: CreateComplaintDto, @ActiveUser("sub") citizenId: number) {
    return this.complaintsService.raiseComplaint(createComplaintDto, citizenId);
  }

  @SetAllowedRoles(Role.Citizen)
  @Get("my-complaints")
  async getCitizenComplaints(@ActiveUser("sub") citizenId: number) {
    return await this.complaintsService.getCitizenComplaints(citizenId);
  }

  //todo: Receive/Process
  @Get("assigned")
  x() {
    return { message: "Receive/Process" };
  }

  @SetAllowedRoles(Role.Employee)
  @Patch(":id/status")
  async updateStatus(
    @Param("id", ParseIntPipe) complaintId: number,
    @Body() updateComplaintDto: UpdateComplaintDto,
    @ActiveUser("sub") employeeId: number,
  ) {
    return await this.complaintsService.updateStatus(complaintId, employeeId, updateComplaintDto);
  }

  @SetAllowedRoles(Role.Employee)
  @Delete(":id/status")
  async archiveComplaint(@Param("id", ParseIntPipe) complaintId: number, @ActiveUser("sub") employeeId: number) {
    return await this.complaintsService.archiveComplaint(complaintId, employeeId);
  }
  //todo: show and trace complaints for citizen
}
