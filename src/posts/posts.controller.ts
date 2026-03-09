import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new post' })
  create(@Body() dto: CreatePostDto, @CurrentUser('userId') userId: string) {
    return this.postsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts (paginated, filterable)' })
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured posts' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findFeatured(@Query('limit') limit?: number) {
    return this.postsService.findFeatured(limit || 3);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get post by slug' })
  @ApiParam({ name: 'slug', example: 'building-scalable-vue-apps-2025' })
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a post (author or admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.postsService.update(id, dto, userId, role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a post (author or admin)' })
  remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.postsService.remove(id, userId, role);
  }
}
