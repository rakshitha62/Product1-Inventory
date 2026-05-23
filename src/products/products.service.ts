import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { eq, ilike, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { db } from "../db/db";
import { products } from "../db/schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

export interface ProductQuery {
  search?: string;
  category?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price" | "stock" | "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {

  // ── CREATE ─────────────────────────────────────────────────
  async create(dto: CreateProductDto) {
    const existing = await db.select().from(products).where(eq(products.sku, dto.sku)).limit(1);
    if (existing.length > 0) throw new ConflictException(`SKU "${dto.sku}" already exists`);

    const [product] = await db.insert(products).values({
      name: dto.name, description: dto.description,
      category: dto.category, price: String(dto.price),
      stock: dto.stock, sku: dto.sku,
      imageUrl: dto.imageUrl, isActive: dto.isActive ?? true,
    }).returning();
    return product;
  }

  // ── READ ALL ───────────────────────────────────────────────
  async findAll(query: ProductQuery = {}) {
    const { search, category, isActive, minPrice, maxPrice,
      sortBy = "createdAt", order = "desc", page = 1, limit = 10 } = query;

    const conditions = [];
    if (search)    conditions.push(ilike(products.name, `%${search}%`));
    if (category)  conditions.push(eq(products.category, category as any));
    if (isActive !== undefined) conditions.push(eq(products.isActive, isActive));
    if (minPrice !== undefined) conditions.push(gte(products.price, String(minPrice)));
    if (maxPrice !== undefined) conditions.push(lte(products.price, String(maxPrice)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const sortMap: Record<string, any> = {
      name: products.name, price: products.price,
      stock: products.stock, createdAt: products.createdAt,
    };
    const orderFn = order === "asc" ? asc : desc;
    const offset = (page - 1) * limit;

    const [rows, countResult] = await Promise.all([
      db.select().from(products).where(where).orderBy(orderFn(sortMap[sortBy])).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(products).where(where),
    ]);

    return { data: rows, meta: { total: Number(countResult[0].count), page, limit, totalPages: Math.ceil(Number(countResult[0].count) / limit) } };
  }

  // ── READ ONE ────────────────────────────────────────────────
  async findOne(id: number) {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  // ── UPDATE ──────────────────────────────────────────────────
  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    if (dto.sku) {
      const conflict = await db.select().from(products)
        .where(and(eq(products.sku, dto.sku), sql`id != ${id}`)).limit(1);
      if (conflict.length > 0) throw new ConflictException(`SKU "${dto.sku}" already in use`);
    }
    const [updated] = await db.update(products)
      .set({ ...dto, price: dto.price !== undefined ? String(dto.price) : undefined })
      .where(eq(products.id, id)).returning();
    return updated;
  }

  // ── DELETE ──────────────────────────────────────────────────
  async remove(id: number) {
    await this.findOne(id);
    await db.delete(products).where(eq(products.id, id));
    return { message: `Product #${id} deleted successfully` };
  }

  // ── STATS ───────────────────────────────────────────────────
  async getStats() {
    const [stats] = await db.select({
      totalProducts:  sql<number>`count(*)`,
      activeProducts: sql<number>`count(*) filter (where is_active = true)`,
      totalStock:     sql<number>`sum(stock)`,
      avgPrice:       sql<number>`round(avg(price::numeric), 2)`,
      lowStock:       sql<number>`count(*) filter (where stock < 10)`,
    }).from(products);
    return stats;
  }
}
