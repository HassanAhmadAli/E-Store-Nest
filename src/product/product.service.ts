import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";
import { PrismaService, PrismaClientKnownRequestError } from "@/prisma";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const { name, brand } = createProductDto;
    return await this.prisma.product.create({
      data: {
        name,
        brand,
      },
    });
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return await this.prisma.product.findMany({
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number) {
    const res = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (res == undefined) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return res;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: {
          id,
        },
        data: updateProductDto,
      });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
        throw new NotFoundException(`Product #${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    return await this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}
