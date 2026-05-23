import {
  pgTable, serial, varchar, text,
  numeric, integer, pgEnum, timestamp, boolean,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", [
  "electronics", "clothing", "food", "furniture", "tools", "other",
]);

export const products = pgTable("products", {
  id:          serial("id").primaryKey(),
  name:        varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category:    categoryEnum("category").notNull().default("other"),
  price:       numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock:       integer("stock").notNull().default(0),
  sku:         varchar("sku", { length: 100 }).unique().notNull(),
  imageUrl:    varchar("image_url", { length: 500 }),
  isActive:    boolean("is_active").notNull().default(true),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

export type Product    = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
