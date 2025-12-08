import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UnauthorizedException,
} from "@nestjs/common";
import { DepartmentService } from "./department.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { ActiveUser, type ActiveUserType } from "@/iam/decorators/ActiveUser.decorator";
import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";

@Controller("department")
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  async create(@Body() createDepartmentDto: CreateDepartmentDto, @ActiveUser("Admin") _user: ActiveUserType) {
    return await this.departmentService.create(createDepartmentDto);
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto, @ActiveUser() user: ActiveUserType) {
    if (query.deleted && !(user.role === "Admin" || user.role === "Debugging")) {
      throw new UnauthorizedException("you does not have permissions to see deleted items");
    }
    return await this.departmentService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.departmentService.findOne(id);
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @ActiveUser("Admin") _user: ActiveUserType,
  ) {
    return await this.departmentService.update(id, updateDepartmentDto);
  }

  @Patch("archive/:id")
  async reactivateArchived(@Param("id", ParseIntPipe) id: number, @ActiveUser("Admin") _user: ActiveUserType) {
    return await this.departmentService.unArchive(id);
  }

  @Delete("archive/:id")
  async archive(@Param("id", ParseIntPipe) id: number, @ActiveUser("Admin") _user: ActiveUserType) {
    return await this.departmentService.archive(id);
  }

  @Delete("delete/:id")
  async delete(@Param("id", ParseIntPipe) id: number, @ActiveUser("Admin") _user: ActiveUserType) {
    return await this.departmentService.delete(id);
  }
}
