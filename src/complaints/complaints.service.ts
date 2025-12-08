import { ConflictException, Injectable } from "@nestjs/common";
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
        departmentId: 1,
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

  async getCitizenComplaints(citizenId: number) {
    return await this.prisma.complaint.findMany({
      where: {
        deletedAt: null,
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
           "id" = ${complaintId} AND "deletedAt" IS NULL
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
          deletedAt: null,
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
  async archiveComplaint(complaintId: number, userId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const complaints = await tx.$queryRaw<Pick<Prisma.ComplaintModel, "id" | "isArchived" | "assignedEmployeeId">[]>(
        Prisma.sql` SELECT id, "isArchived", "assignedEmployeeId"
      FROM "Complaint"
      WHERE id = ${complaintId} AND deletedAt IS NULL
      FOR UPDATE
    `,
      );
      const complaint = complaints[0];
      if (complaint == undefined) {
        throw new ConflictException("Complaint Not Found");
      }
      if (complaint.isArchived === true) {
        throw new ConflictException("Complaint already archived");
      }
      if (complaint.assignedEmployeeId !== userId) {
        throw new ConflictException("Employee does not have permissions to archive this Complaint");
      }
      const updated = await tx.complaint.update({
        where: {
          deletedAt: null,
          id: complaintId,
        },
        data: {
          isArchived: true,
        },
      });
      return updated;
    });
  }
}
