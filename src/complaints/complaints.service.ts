import { Injectable } from "@nestjs/common";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
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

  findAll() {
    return `This action returns all complaints`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaint`;
  }

  update(id: number, _updateComplaintDto: UpdateComplaintDto) {
    return `This action updates a #${id} complaint`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaint`;
  }
}
