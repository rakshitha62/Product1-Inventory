import {
  IsString, IsOptional, IsEnum, IsNumber, IsInt, IsBoolean, Min, MaxLength, MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { Category } from "./create-product.dto";

export class UpdateProductDto {
  @IsString() @IsOptional() @MaxLength(255)
  name?: string;

  @IsString() @IsOptional()
  description?: string;

  @IsEnum(["electronics", "clothing", "food", "furniture", "tools", "other"]) @IsOptional()
  category?: Category;

  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Type(() => Number) @IsOptional()
  price?: number;

  @IsInt() @Min(0) @Type(() => Number) @IsOptional()
  stock?: number;

  @IsString() @IsOptional() @MinLength(3) @MaxLength(100)
  sku?: string;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
