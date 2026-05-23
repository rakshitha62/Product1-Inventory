# 📦 Inventory CRUD — NestJS + TypeScript + PostgreSQL + Drizzle ORM

A complete full-stack CRUD application built entirely with **NestJS** — both backend API and frontend served from the same server.

---

## 🏗 Project Structure

```
inventory-crud/
├── src/
│   ├── db/
│   │   ├── db.ts           ← Drizzle ORM connection
│   │   ├── schema.ts       ← PostgreSQL table definitions
│   │   └── seed.ts         ← Mock data seeder (8 products)
│   ├── products/
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts   ← Validation rules (POST)
│   │   │   └── update-product.dto.ts   ← Partial validation (PUT)
│   │   ├── products.controller.ts      ← REST route handlers
│   │   ├── products.service.ts         ← Drizzle ORM queries
│   │   └── products.module.ts
│   ├── public/
│   │   ├── index.html      ← Frontend UI (served by NestJS)
│   │   ├── css/style.css   ← Styles
│   │   └── js/app.js       ← Frontend JS (calls REST API)
│   ├── app.module.ts
│   └── main.ts             ← Bootstrap
├── drizzle/                ← Auto-generated migrations
├── drizzle.config.ts
├── nest-cli.json
├── tsconfig.json
├── .env.example
└── package.json
```

---

## 🚀 Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set your PostgreSQL DATABASE_URL
```

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
PORT=3000
```

### 3. Create the database
```bash
# In PostgreSQL:
CREATE DATABASE inventory_db;
```

### 4. Push schema to database
```bash
npm run db:push
```

### 5. Seed mock data (8 sample products)
```bash
npm run db:seed
```

### 6. Start the server
```bash
npm run start:dev     # development (hot reload)
npm run start         # production
```

### 7. Open the app
```
http://localhost:3000
```

---

## 📋 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products (filter, search, paginate) |
| `GET` | `/api/products/stats` | Inventory statistics |
| `GET` | `/api/products/:id` | Get single product |
| `POST` | `/api/products` | Create new product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |

### Query Parameters (GET /api/products)

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `search` | string | `wireless` | Search by name |
| `category` | string | `electronics` | Filter by category |
| `isActive` | boolean | `true` | Filter by status |
| `minPrice` | number | `50` | Minimum price |
| `maxPrice` | number | `200` | Maximum price |
| `sortBy` | string | `price` | Sort field |
| `order` | string | `asc` | Sort direction |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page |

---

## 🗄 Database Schema

```sql
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  category    category_enum NOT NULL DEFAULT 'other',
  price       NUMERIC(10,2) NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  sku         VARCHAR(100) UNIQUE NOT NULL,
  image_url   VARCHAR(500),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

Categories: `electronics` | `clothing` | `food` | `furniture` | `tools` | `other`

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **NestJS** (Node.js) |
| Language | **TypeScript** |
| Database | **PostgreSQL** |
| ORM | **Drizzle ORM** |
| Validation | **class-validator** |
| Frontend | HTML + CSS + Vanilla JS (served by NestJS) |

---

## 🌱 Other Commands

```bash
npm run db:push      # sync schema to PostgreSQL
npm run db:studio    # open Drizzle Studio (visual DB browser)
npm run db:seed      # insert 8 mock products
npm run build        # compile TypeScript
```
