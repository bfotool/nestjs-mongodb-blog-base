import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Tag, TagDocument } from './schemas/tag.schema';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<TagDocument>) {}

  async create(dto: CreateTagDto): Promise<TagDocument> {
    const slug = dto.slug || slugify(dto.name, { lower: true, strict: true });
    const existing = await this.tagModel.findOne({ slug });
    if (existing) return existing; // Auto-return existing tag
    return new this.tagModel({ ...dto, slug }).save();
  }

  async findOrCreateMany(names: string[]): Promise<TagDocument[]> {
    const tags: TagDocument[] = [];
    for (const name of names) {
      const tag = await this.create({ name });
      tags.push(tag);
    }
    return tags;
  }

  async findAll(): Promise<TagDocument[]> {
    return this.tagModel.find().sort({ name: 1 }).exec();
  }

  async findBySlug(slug: string): Promise<TagDocument> {
    const tag = await this.tagModel.findOne({ slug });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async update(id: string, dto: UpdateTagDto): Promise<TagDocument> {
    if (dto.name && !dto.slug) {
      dto.slug = slugify(dto.name, { lower: true, strict: true });
    }
    const tag = await this.tagModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tagModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Tag not found');
  }
}
