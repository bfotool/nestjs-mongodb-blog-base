import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great article! Very helpful.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ description: 'Post ID' })
  @IsString()
  @IsNotEmpty()
  post!: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
  @IsOptional()
  @IsString()
  parentComment?: string;
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
