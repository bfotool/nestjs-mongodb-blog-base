import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(dto: CreateCommentDto, authorId: string): Promise<CommentDocument> {
    const comment = new this.commentModel({
      ...dto,
      author: authorId,
    });
    const saved = await comment.save();
    return this.commentModel
      .findById(saved._id)
      .populate('author', 'name avatar')
      .exec() as Promise<CommentDocument>;
  }

  async findByPost(
    postId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<CommentDocument>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const filter = { post: postId, parentComment: null };

    const [data, total] = await Promise.all([
      this.commentModel
        .find(filter)
        .populate('author', 'name avatar')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findReplies(commentId: string): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ parentComment: commentId })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  async update(
    id: string,
    dto: UpdateCommentDto,
    userId: string,
    userRole: string,
  ): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.author.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = dto.content || comment.content;
    const updated = await comment.save();
    return this.commentModel
      .findById(updated._id)
      .populate('author', 'name avatar')
      .exec() as Promise<CommentDocument>;
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.commentModel.findById(id);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.author.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete replies too
    await this.commentModel.deleteMany({ parentComment: id }).exec();
    await this.commentModel.findByIdAndDelete(id).exec();
  }
}
