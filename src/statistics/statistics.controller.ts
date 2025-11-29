import { Controller, Delete, Get, Patch, Post } from "@nestjs/common";
@Controller("statistics")
export class StatisticsController {
  //todo: Manage Statistics
  @Get()
  manageStatistics() {
    return { message: "Manage Statistics" };
  }

  //todo: Add Employee
  @Post()
  addEmployee() {
    // (Role=Employee)
    return { message: "Add Employee" };
  }

  //todo: Promote to Admin
  @Patch()
  promoteToAdmin() {
    return { message: "Promote to Manager" };
  }

  //todo: Delete Account
  @Delete()
  deleteAccount() {
    return { message: "Delete Account" };
  }
}
