import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./db";
import { products } from "./schema";

const mockProducts = [
  { name: "Wireless Bluetooth Headphones", description: "Premium over-ear headphones with ANC and 30hr battery.", category: "electronics" as const, price: "129.99", stock: 45, sku: "ELEC-WBH-001", isActive: true },
  { name: "Mechanical Keyboard", description: "Tenkeyless with Cherry MX switches and RGB backlighting.", category: "electronics" as const, price: "89.95", stock: 30, sku: "ELEC-MKB-002", isActive: true },
  { name: "Ergonomic Office Chair", description: "Adjustable lumbar support, mesh back, armrests.", category: "furniture" as const, price: "349.00", stock: 12, sku: "FURN-EOC-001", isActive: true },
  { name: "Men's Running Shoes", description: "Lightweight breathable shoes with cushioned sole.", category: "clothing" as const, price: "74.99", stock: 80, sku: "CLTH-MRS-001", isActive: true },
  { name: "Stainless Steel Water Bottle", description: "32oz double-wall insulated. Cold 24hr, hot 12hr.", category: "other" as const, price: "29.99", stock: 150, sku: "OTHR-SWB-001", isActive: true },
  { name: "Power Drill Set", description: "Cordless 20V drill with 2 batteries and 40-piece kit.", category: "tools" as const, price: "119.00", stock: 25, sku: "TOOL-PDS-001", isActive: true },
  { name: "Organic Green Tea", description: "100% organic Japanese green tea. Pack of 50 bags.", category: "food" as const, price: "14.99", stock: 200, sku: "FOOD-OGT-001", isActive: true },
  { name: "USB-C Hub 7-in-1", description: "HDMI 4K, 3x USB-A, SD card, 100W PD charging.", category: "electronics" as const, price: "49.99", stock: 5, sku: "ELEC-UCH-003", isActive: false },
];

async function seed() {
  console.log("🌱 Seeding database...");
  try {
    await db.delete(products);
    const inserted = await db.insert(products).values(mockProducts).returning();
    console.log(`✅ Inserted ${inserted.length} products!`);
    inserted.forEach((p) => console.log(`   [${p.id}] ${p.name} — ${p.sku}`));
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
  process.exit(0);
}

seed();
