import { CreateEmployeeDto } from "@/user/dto/create-user.dto";
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { ActiveUser, type ActiveUserType } from "@/iam/decorators/ActiveUser.decorator";
import { SetAllowedRoles } from "@/iam/authorization/decorators/roles.decorator";
import { Role } from "@/prisma";
@Controller("statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
  //todo: Manage Statistics
  @Get()
  manageStatistics() {
    return { message: "Manage Statistics" };
  }

  @SetAllowedRoles(Role.Admin)
  @Post()
  async addEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return await this.statisticsService.addEmployee(createEmployeeDto);
  }

  @SetAllowedRoles(Role.Admin)
  @Patch(":id")
  async promoteToAdmin(@Param("id", ParseIntPipe) employeeId: number) {
    return await this.statisticsService.promoteToAdmin(employeeId);
  }

  @SetAllowedRoles(Role.Admin)
  @Delete(":id")
  async deleteAccount(@Param("id") userId: number, @ActiveUser() admin: ActiveUserType) {
    const adminId = admin.sub;
    return await this.statisticsService.deleteAccount(userId, adminId);
  }
}
