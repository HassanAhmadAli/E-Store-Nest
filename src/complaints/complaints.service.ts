import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { Prisma, PrismaService } from "@/prisma";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { getEntriesOfTrue } from "@/utils";
import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";
import { Notification } from "@/notifications/notification.interface";
import { CachingService } from "@/common/caching/caching.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Keys } from "@/common/const";
import { Queue } from "bullmq";
@Injectable()
export class ComplaintsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cachingService: CachingService,
    @InjectQueue(Keys.notification) private readonly notificationQueue: Queue<Notification>,
  ) {}
  private get prisma() {
    return this.prismaService.client;
  }

  private async notifyUser(
    notification: {
      userId: number;
      title: Notification["title"];
      message: Notification["message"];
      email: Notification["email"];
    },
    type: Notification["type"] = "info",
  ) {
    await this.notificationQueue.add("send-notification", {
      ...notification,
      type,
      createdAt: new Date(),
    });
  }

  async raiseComplaint(createComplaintDto: CreateComplaintDto, citizenId: number) {
    const res = await this.prisma.complaint.create({
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
    await this.notifyUser({
      userId: citizenId,
      title: "complaint raised",
      message: "your complaint was successfully raised",
      email: null,
    });
    return res;
  }
  async citizenAttachFileToComplaint(citizenId: number, email: string, complaintId: string, file: Express.Multer.File) {
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
    await this.notifyUser({
      userId: citizenId,
      title: "attachment upload",
      message: "attachment was successfully uploaded",
      email,
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
  async getComplaintAndLockOrThrow({ complaintId, employeeId }: { complaintId: string; employeeId: number }) {
    try {
      const complaint = await this.prisma.complaint.update({
        where: {
          id: complaintId,
          lockedAt: null,
          lockedById: null,
        },
        data: {
          lockedById: employeeId,
          lockedAt: new Date(),
        },
      });
      return complaint;
    } catch {
      const complaint = await this.prisma.complaint.findUnique({
        where: { id: complaintId },
      });
      if (complaint == undefined) {
        throw new ConflictException("Complaint does not exist");
      }
      // todo: unlock if necessary
      throw new ConflictException("Complaint is already Being processed by another employee");
    }
  }
  async assignComplaint(complaintId: string, employeeId: number) {
    let complaint = await this.getComplaintAndLockOrThrow({ complaintId, employeeId });
    try {
      const employee = await this.prisma.user.findUnique({
        where: {
          id: employeeId,
          departmentId: { not: null },
        },
        select: {
          departmentId: true,
        },
      });
      if (employee == undefined) {
        throw new UnauthorizedException("Employee does not belong to any department");
      }
      if (complaint.departmentId != employee.departmentId) {
        throw new UnauthorizedException("You does not belone to the same department of this complaint");
      }
      complaint = await this.prisma.complaint.update({
        where: {
          id: complaintId,
        },
        data: {
          assignedEmployeeId: employeeId,
        },
      });
      const { email } = await this.cachingService.users.getCachedUserData(complaint.citizenId);
      await this.notifyUser({
        userId: complaint.citizenId,
        title: "complaint update",
        message: "an employee was assigned to your complaint, a response will be given soon",
        email,
      });
      await this.prisma.complaint.update({
        where: { id: complaintId },
        data: { lockedById: null, lockedAt: null },
      });
      return complaint;
    } catch (e) {
      await this.prisma.complaint.update({
        where: { id: complaintId },
        data: { lockedById: null, lockedAt: null },
      });
      throw e;
    }
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
          ...getEntriesOfTrue(updateComplaintDto),
          id: true,
        } satisfies Prisma.ComplaintSelect,
      });
      const { email } = await this.cachingService.users.getCachedUserData(complaint.citizenId);
      await this.notifyUser({
        userId: complaint.citizenId,
        title: "complaint status update",
        message: `the status of your complaint was updated to ${updateComplaintDto.status}`,
        email,
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
      const res = await tx.complaint.update({
        where: {
          id: complaintId,
        },
        data: {
          isArchived: true,
        },
      });
      const { email } = await this.cachingService.users.getCachedUserData(res.citizenId);
      await this.notifyUser({
        userId: res.citizenId,
        title: "complaint archived",
        message: "your complaint was archived by the assigned employee",
        email,
      });
      return res;
    });
  }
}
