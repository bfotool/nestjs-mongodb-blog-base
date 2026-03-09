import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const slug = dto.slug || slugify(dto.name, { lower: true, strict: true });

    const existing = await this.categoryModel.findOne({ slug });
    if (existing) throw new ConflictException('Category slug already exists');

    return new this.categoryModel({ ...dto, slug }).save();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const cat = await this.categoryModel.findOne({ slug });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async findById(id: string): Promise<CategoryDocument> {
    const cat = await this.categoryModel.findById(id);
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    if (dto.name && !dto.slug) {
      dto.slug = slugify(dto.name, { lower: true, strict: true });
    }
    const cat = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Category not found');
  }
}
