import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostStatus } from '../schemas/post.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreatePostDto {
  @ApiProperty({ example: 'Building Scalable Vue Applications in 2025' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'building-scalable-vue-applications-2025' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'A comprehensive guide to structuring large-scale Vue projects.' })
  @IsString()
  @IsNotEmpty()
  excerpt!: string;

  @ApiProperty({ example: '## Introduction\n\nFull markdown content...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'https://picsum.photos/seed/vue-scale/1200/630' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: 'Category ID', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({
    description: 'Tag names (will be auto-created if not existing)',
    example: ['Vue', 'TypeScript', 'Architecture'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.DRAFT })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class QueryPostDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by tag slug' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ enum: PostStatus })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ description: 'Filter by author ID' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'title', 'readingTime'], default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
