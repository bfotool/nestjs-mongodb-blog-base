import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @ApiProperty({ example: 'Web Development' })
  @Prop({ required: true, trim: true })
  name!: string;

  @ApiProperty({ example: 'web-development' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @ApiProperty({ example: 'Frontend and backend tutorials and best practices.' })
  @Prop({ default: '' })
  description!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ slug: 1 });
