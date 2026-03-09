import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TagDocument = HydratedDocument<Tag>;

@Schema({ timestamps: true })
export class Tag {
  @ApiProperty({ example: 'TypeScript' })
  @Prop({ required: true, trim: true })
  name!: string;

  @ApiProperty({ example: 'typescript' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
TagSchema.index({ slug: 1 });
