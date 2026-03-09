import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import slugify from 'slugify';
import { Post, PostDocument, PostStatus } from './schemas/post.schema';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from './dto/post.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { TagsService } from '../tags/tags.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly tagsService: TagsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreatePostDto, authorId: string): Promise<PostDocument> {
    const slug = dto.slug || slugify(dto.title, { lower: true, strict: true });

    // Validate category exists
    await this.categoriesService.findById(dto.category);

    // Auto-create tags
    let tagIds: string[] = [];
    if (dto.tags && dto.tags.length > 0) {
      const tags = await this.tagsService.findOrCreateMany(dto.tags);
      tagIds = tags.map((t) => t._id.toString());
    }

    // Calculate reading time
    const wordsPerMinute = 200;
    const words = dto.content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / wordsPerMinute));

    const post = new this.postModel({
      ...dto,
      slug,
      author: authorId,
      tags: tagIds,
      readingTime,
    });

    const saved = await post.save();
    return this.findBySlug(saved.slug);
  }

  async findAll(query: QueryPostDto): Promise<PaginatedResult<PostDocument>> {
    const { page = 1, limit = 10, search, category, tag, status, author, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<PostDocument> = {};

    // Default: only show published posts for public
    if (status) {
      filter.status = status;
    } else {
      filter.status = PostStatus.PUBLISHED;
    }

    if (author) {
      filter.author = author;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Filter by category slug
    if (category) {
      const cat = await this.categoriesService.findBySlug(category);
      filter.category = cat._id;
    }

    // Filter by tag slug
    if (tag) {
      const tagDoc = await this.tagsService.findBySlug(tag);
      filter.tags = { $in: [tagDoc._id] };
    }

    // Sort
    const sortField = sortBy || 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDir };

    const [data, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('author', 'name avatar bio')
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findBySlug(slug: string): Promise<PostDocument> {
    const post = await this.postModel
      .findOne({ slug })
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug description')
      .populate('tags', 'name slug')
      .exec();

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findFeatured(limit: number = 3): Promise<PostDocument[]> {
    return this.postModel
      .find({ featured: true, status: PostStatus.PUBLISHED })
      .populate('author', 'name avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(
    id: string,
    dto: UpdatePostDto,
    userId: string,
    userRole: string,
  ): Promise<PostDocument> {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    // Only author or admin can update
    if (post.author.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only update your own posts');
    }

    if (dto.title && !dto.slug) {
      dto.slug = slugify(dto.title, { lower: true, strict: true });
    }

    if (dto.tags) {
      const tags = await this.tagsService.findOrCreateMany(dto.tags);
      (dto as Record<string, unknown>).tags = tags.map((t) => t._id);
    }

    if (dto.content) {
      const words = dto.content.trim().split(/\s+/).length;
      (post as unknown as Record<string, unknown>).readingTime = Math.max(1, Math.ceil(words / 200));
    }

    Object.assign(post, dto);
    const updated = await post.save();
    return this.findBySlug(updated.slug);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    if (post.author.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postModel.findByIdAndDelete(id).exec();
  }
}
