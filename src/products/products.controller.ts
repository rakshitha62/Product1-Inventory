import {
  Controller, Get, Post, Put, Delete, Body,
  Param, Query, ParseIntPipe, HttpCode, HttpStatus, ValidationPipe,
} from "@nestjs/common";
import { ProductsService, ProductQuery } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Controller("api/products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /api/products
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  // GET /api/products/stats
  @Get("stats")
  getStats() {
    return this.productsService.getStats();
  }

  // GET /api/products
  @Get()
  findAll(@Query() query: ProductQuery) {
    return this.productsService.findAll({
      ...query,
      page:     query.page     ? Number(query.page)     : 1,
      limit:    query.limit    ? Number(query.limit)    : 10,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      isActive: query.isActive !== undefined ? String(query.isActive) === "true" : undefined,
    });
  }

  // GET /api/products/:id
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // PUT /api/products/:id
  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  // DELETE /api/products/:id
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
