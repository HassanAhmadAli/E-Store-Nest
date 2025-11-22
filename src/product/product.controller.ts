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
  UseInterceptors,
} from "@nestjs/common";
import _ from "lodash";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";
import { CacheInterceptor, CacheKey } from "@nestjs/cache-manager";
import { logger } from "@/logger";

@UseInterceptors(CacheInterceptor)
@CacheKey("producs")
@Controller("product")
export class ProductController {
  constructor(private readonly ProductService: ProductService) {}
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.ProductService.create(createProductDto);
  }

  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    logger.info("getting products from DB");
    return await this.ProductService.findAll(paginationQuery);
  }
  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.ProductService.findOne(id);
  }

  @Patch(":id")
  async update(@Param("id", ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return await this.ProductService.update(id, updateProductDto);
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return await this.ProductService.remove(id);
  }
}
