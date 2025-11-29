import { ConflictException, Injectable } from "@nestjs/common";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { Prisma, PrismaService, Complaint } from "@/prisma";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { getKeysOfTrue } from "@/common/utils";

@Injectable()
export class ComplaintsService {
  constructor(private readonly prismaService: PrismaService) {}
  async raiseComplaint(createComplaintDto: CreateComplaintDto, citizenId: number) {
    return await this.prismaService.client.complaint.create({
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
  async getCitizenComplaints(citizenId: number) {
    return await this.prismaService.client.complaint.findMany({
      where: {
        citizenId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        assignedEmployeeId: true,
      } as Prisma.ComplaintSelect,
    });
  }

  async updateStatus(complaintId: number, employeeId: number, updateComplaintDto: UpdateComplaintDto) {
    return await this.prismaService.client.$transaction(async (tx) => {
      const complaints = await tx.$queryRaw<Complaint[]>`
      SELECT *
      FROM "Complaint"
      WHERE id = ${complaintId}
      FOR UPDATE
      `;
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
}
