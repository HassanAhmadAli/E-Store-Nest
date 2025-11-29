import { Injectable } from "@nestjs/common";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { PrismaService } from "@/prisma";

@Injectable()
export class ComplaintsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createComplaintDto: CreateComplaintDto, citizenId: number) {
    return await this.prismaService.client.complaint.create({
      data: {
        ...createComplaintDto,
        citizenId,
      },
      select: {
        title: true,
        description: true,
        status: true,
      },
    });
  }
}
