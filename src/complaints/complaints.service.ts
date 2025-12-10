import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { Prisma, PrismaService, Complaint } from "@/prisma";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { getKeysOfTrue } from "@/utils";
@Injectable()
export class ComplaintsService {
  constructor(private readonly prismaService: PrismaService) {}
  private get prisma() {
    return this.prismaService.client;
  }

  async raiseComplaint(createComplaintDto: CreateComplaintDto, citizenId: number) {
    return await this.prisma.complaint.create({
      data: {
        ...createComplaintDto,
        citizenId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        assignedEmployeeId: true,
      },
    });
  }

  async getDepartmentComplaints(departmentId: number) {
    return await this.prisma.complaint.findMany({
      where: {
        departmentId,
      },
    });
  }
  async assignComplaint(complaintId: number, employeeId: number) {
    const employee = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: employeeId,
      },
      select: {
        departmentId: true,
      },
    });
    if (employee.departmentId == null) {
      throw new UnauthorizedException("You Does Not belone to a department");
    }
    const complaint = await this.prisma.complaint.findUniqueOrThrow({
      where: {
        id: complaintId,
      },
      select: {
        departmentId: true,
      },
    });
    if (complaint.departmentId != employee.departmentId) {
      console.log({ employee, complaint });
      throw new UnauthorizedException("You does not belone to the same department of this complaint");
    }
    return await this.prisma.complaint.update({
      where: {
        id: complaintId,
      },
      data: {
        assignedEmployeeId: employeeId,
      },
    });
  }
  async getEmployeeComplaints(employeeId: number) {
    return await this.prisma.complaint.findMany({
      where: {
        assignedEmployeeId: employeeId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        assignedEmployeeId: true,
      } satisfies Prisma.ComplaintSelect,
    });
  }
  async getCitizenComplaints(citizenId: number) {
    return await this.prisma.complaint.findMany({
      where: {
        citizenId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        assignedEmployeeId: true,
      } satisfies Prisma.ComplaintSelect,
    });
  }

  async updateStatus(complaintId: number, employeeId: number, updateComplaintDto: UpdateComplaintDto) {
    return await this.prisma.$transaction(async (tx) => {
      const complaints = await tx.$queryRaw<Complaint[]>(Prisma.sql`
      SELECT *
      FROM "Complaint"
      WHERE
           "id" = ${complaintId} AND "Complaint"."deletedAt" IS NULL
      FOR UPDATE
      `);
      const complaint = complaints[0];
      if (complaint == undefined) {
        throw new ConflictException("Complaint does not exist");
      }
      if (complaint?.assignedEmployeeId !== employeeId) {
        throw new ConflictException("Employee does not have permissions on this complaint");
      }

      //todo: set the logs
      const updatedComplaint = await tx.complaint.update({
        where: {
          id: complaintId,
          assignedEmployeeId: employeeId,
        },
        data: updateComplaintDto,
        select: {
          ...getKeysOfTrue(updateComplaintDto),
          id: true,
        } satisfies Prisma.ComplaintSelect,
      });
      return updatedComplaint;
    });
  }
  async archiveComplaint(complaintId: number, employeeId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const complaints = await tx.$queryRaw<Complaint[]>(Prisma.sql`
         SELECT * FROM "Complaint"
          WHERE "id" = ${complaintId} AND "Complaint"."deletedAt" IS NULL
          FOR UPDATE`);
      const complaint = complaints[0];
      if (complaint == undefined) {
        throw new ConflictException("Complaint Not Found");
      }
      if (complaint.isArchived === true) {
        throw new ConflictException("Complaint already archived");
      }
      if (complaint.assignedEmployeeId !== employeeId) {
        throw new ConflictException("Employee does not have permissions to archive this Complaint");
      }
      return await tx.complaint.update({
        where: {
          id: complaintId,
        },
        data: {
          isArchived: true,
        },
      });
    });
  }
}
