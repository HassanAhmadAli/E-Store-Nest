import { CreateEmployeeDto } from "@/user/dto/create-user.dto";
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";
import { ActiveUser, type ActiveUserType } from "@/iam/decorators/ActiveUser.decorator";
@Controller("statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
  //todo: Manage Statistics
  @Get()
  manageStatistics() {
    return { message: "Manage Statistics" };
  }

  @Post()
  async addEmployee(@Body() createEmployeeDto: CreateEmployeeDto, @ActiveUser("Admin") _user: ActiveUserType) {
    return await this.statisticsService.addEmployee(createEmployeeDto);
  }

  @Patch(":id")
  async promoteToAdmin(@Param("id", ParseIntPipe) employeeId: number, @ActiveUser("Admin") _user: ActiveUserType) {
    return await this.statisticsService.promoteToAdmin(employeeId);
  }

  @Delete(":id")
  async deleteAccount(@Param("id") userId: number, @ActiveUser("Admin") admin: ActiveUserType) {
    const adminId = admin.sub;
    return await this.statisticsService.deleteAccount(userId, adminId);
  }
}
