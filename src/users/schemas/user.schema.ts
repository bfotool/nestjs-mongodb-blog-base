import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  READER = 'reader',
}

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class User {
  @ApiProperty({ example: 'sarah.chen@example.com' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @ApiProperty({ example: 'Sarah Chen' })
  @Prop({ required: true, trim: true })
  name!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.AUTHOR })
  @Prop({ type: String, enum: UserRole, default: UserRole.READER })
  role!: UserRole;

  @ApiProperty({ example: 'https://picsum.photos/seed/sarah/200/200' })
  @Prop({ default: '' })
  avatar!: string;

  @ApiProperty({ example: 'Full-stack developer with 8 years of experience.' })
  @Prop({ default: '' })
  bio!: string;

  @Prop({ select: false })
  refreshToken?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for faster lookups
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
