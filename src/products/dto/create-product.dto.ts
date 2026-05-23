import {
  IsString, IsNotEmpty, IsNumber, IsOptional,
  IsEnum, IsInt, IsBoolean, Min, MaxLength, MinLength,
} from "class-validator";
import { Type } from "class-transformer";

export type Category = "electronics" | "clothing" | "food" | "furniture" | "tools" | "other";

export class CreateProductDto {
  @IsString() @IsNotEmpty() @MaxLength(255)
  name: string;

  @IsString() @IsOptional()
  description?: string;

  @IsEnum(["electronics","clothing","food","furniture","tools","other"])
  category: Category;

  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number)
  price: number;

  @IsInt() @Min(0) @Type(() => Number)
  stock: number;

  @IsString() @IsNotEmpty() @MinLength(3) @MaxLength(100)
  sku: string;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
