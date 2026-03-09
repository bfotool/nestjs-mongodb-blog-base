import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/user.schema';
import { Category } from '../../categories/schemas/category.schema';
import { Tag } from '../../tags/schemas/tag.schema';

export type PostDocument = HydratedDocument<Post>;

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Post {
  @ApiProperty({ example: 'Building Scalable Vue Applications in 2025' })
  @Prop({ required: true, trim: true })
  title!: string;

  @ApiProperty({ example: 'building-scalable-vue-applications-2025' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @ApiProperty({ example: 'A comprehensive guide to structuring large-scale Vue projects.' })
  @Prop({ required: true })
  excerpt!: string;

  @ApiProperty({ example: '## Introduction\n\nFull markdown content here...' })
  @Prop({ required: true })
  content!: string;

  @ApiProperty({ example: 'https://picsum.photos/seed/vue-scale/1200/630' })
  @Prop({ default: '' })
  coverImage!: string;

  @ApiProperty({ type: String, description: 'Author user ID' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author!: User | Types.ObjectId;

  @ApiProperty({ type: String, description: 'Category ID' })
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category!: Category | Types.ObjectId;

  @ApiProperty({ type: [String], description: 'Tag IDs' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Tag' }], default: [] })
  tags!: (Tag | Types.ObjectId)[];

  @ApiProperty({ enum: PostStatus, example: PostStatus.PUBLISHED })
  @Prop({ type: String, enum: PostStatus, default: PostStatus.DRAFT })
  status!: PostStatus;

  @ApiProperty({ example: 8 })
  @Prop({ default: 1 })
  readingTime!: number;

  @ApiProperty({ example: true })
  @Prop({ default: false })
  featured!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Indexes
PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1, createdAt: -1 });
PostSchema.index({ author: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
