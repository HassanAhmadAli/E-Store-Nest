import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { Prisma, PrismaService, Complaint } from "@/prisma";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { getKeysOfTrue } from "@/utils";
import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";

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
  async citizenAttachFileToComplaint(citizenId: number, complaintId: string, file: Express.Multer.File) {
    const storedFile = await this.prisma.storedFile.create({
      data: {
        id: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        path: file.path,
        size: file.size,
      },
    });
    const attachment = await this.prisma.attachment.create({
      data: {
        storedFileId: storedFile.id,
        complaintId,
        creatorId: citizenId,
      },
      select: {
        createdAt: true,
        storedFileId: true,
      },
    });
    return attachment;
  }
  async getComplaintsAttachments(complaintId: string, { limit, offset, deleted, deletedAt }: PaginationQueryDto) {
    return await this.prisma.attachment.findMany({
      where: {
        complaintId,
        deletedAt,
      },
      skip: offset,
      take: limit,
      select: {
        storedFile: {
          select: {
            id: true,
            originalname: true,
            size: true,
            mimetype: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        updatedAt: deleted,
        deletedAt: deleted,
      },
    });
  }

  async getDepartmentComplaints(employeeId: number) {
    const emp = await this.prisma.user.findUniqueOrThrow({
      where: { id: employeeId },
    });
    return await this.prisma.complaint.findMany({
      where: {
        departmentId: emp.departmentId!,
      },
    });
  }
  async assignComplaint(complaintId: string, employeeId: number) {
    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.user.findUniqueOrThrow({
        where: {
          id: employeeId,
          departmentId: { not: null },
        },
        select: {
          departmentId: true,
        },
      });
      const complaint = await this.prismaService.complaint.findForUpdate(tx, complaintId);
      if (complaint.departmentId != employee.departmentId) {
        throw new UnauthorizedException("You does not belone to the same department of this complaint");
      }
      return await tx.complaint.update({
        where: {
          id: complaintId,
        },
        data: {
          assignedEmployeeId: employeeId,
        },
      });
    });
  }
  async getEmployeeComplaints(employeeId: number) {
    return await this.prisma.complaint.findMany({
      where: {
        assignedEmployeeId: employeeId,
      },
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

  async updateStatus(complaintId: string, employeeId: number, updateComplaintDto: UpdateComplaintDto) {
    return await this.prisma.$transaction(async (tx) => {
      const complaint = await this.prismaService.complaint.findForUpdate(tx, complaintId);
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
  async archiveComplaint(complaintId: string, employeeId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const complaint = await this.prismaService.complaint.findForUpdate(tx, complaintId);
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
