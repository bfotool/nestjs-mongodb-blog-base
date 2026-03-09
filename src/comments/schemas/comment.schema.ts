import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @ApiProperty({ example: 'Great article! Very helpful.' })
  @Prop({ required: true, trim: true })
  content!: string;

  @ApiProperty({ type: String, description: 'Author user ID' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author!: Types.ObjectId;

  @ApiProperty({ type: String, description: 'Post ID' })
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  post!: Types.ObjectId;

  @ApiProperty({ type: String, description: 'Parent comment ID (for replies)', required: false })
  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentComment!: Types.ObjectId | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ post: 1, createdAt: -1 });
