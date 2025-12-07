import { ConflictException, Injectable } from "@nestjs/common";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { PrismaService } from "@/prisma";
import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";

@Injectable()
export class DepartmentService {
  constructor(private readonly prismaService: PrismaService) {}
  private get prisma() {
    return this.prismaService.client;
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    return await this.prisma.department.create({
      data: createDepartmentDto,
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }

  async findAll({ limit, offset, deletedItems }: PaginationQueryDto) {
    return await this.prisma.department.findMany({
      where: {
        deletedAt: deletedItems ? { not: null } : null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        deletedAt: deletedItems,
      },
      skip: offset,
      take: limit,
    });
  }

  async findAllArchived({ limit, offset }: PaginationQueryDto) {
    return await this.prisma.department.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        deletedAt: true,
      },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number) {
    return await this.prisma.department.findUniqueOrThrow({
      where: {
        deletedAt: null,
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const res = await this.prisma.department.update({
      where: {
        deletedAt: null,
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      data: updateDepartmentDto,
    });
    if (res == undefined) {
      throw new ConflictException("Complaint Not Found");
    }
    return res;
  }
  async reactivateArchived(id: number) {
    const res = await this.prisma.department.update({
      where: {
        deletedAt: {
          not: null,
        },
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      data: {
        deletedAt: null,
      },
    });
    if (res == undefined) {
      throw new ConflictException("Complaint Not Found");
    }
    return res;
  }
  async remove(id: number) {
    const res = await this.prisma.department.update({
      where: {
        deletedAt: {
          not: null,
        },
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    if (res == undefined) {
      throw new ConflictException("Complaint Not Found");
    }
    return res;
  }
}
