import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: "*" });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Server running at http://localhost:${port}`);
  console.log(`📦 Frontend UI  → http://localhost:${port}`);
  console.log(`\n📋 API Endpoints:`);
  console.log(`   GET    /api/products            — list (filter/search/paginate)`);
  console.log(`   GET    /api/products/stats       — inventory stats`);
  console.log(`   GET    /api/products/:id         — get one product`);
  console.log(`   POST   /api/products             — create product`);
  console.log(`   PUT    /api/products/:id         — update product`);
  console.log(`   DELETE /api/products/:id         — delete product\n`);
}

bootstrap();
