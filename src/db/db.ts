import { drizzle } from "drizzle-orm/postgres-js";
import postgres = require("postgres");
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
export type DB = typeof db;


