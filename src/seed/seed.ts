import { NestFactory } from '@nestjs/core';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/schemas/user.schema';
import { Category } from '../categories/schemas/category.schema';
import { Tag } from '../tags/schemas/tag.schema';
import { Post, PostStatus } from '../posts/schemas/post.schema';
import { Comment } from '../comments/schemas/comment.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const categoryModel = app.get<Model<Category>>(getModelToken(Category.name));
  const tagModel = app.get<Model<Tag>>(getModelToken(Tag.name));
  const postModel = app.get<Model<Post>>(getModelToken(Post.name));
  const commentModel = app.get<Model<Comment>>(getModelToken(Comment.name));

  const isRefresh = process.argv.includes('--refresh');

  if (isRefresh) {
    console.log('🗑️  Dropping existing data...');
    await Promise.all([
      userModel.deleteMany({}),
      categoryModel.deleteMany({}),
      tagModel.deleteMany({}),
      postModel.deleteMany({}),
      commentModel.deleteMany({}),
    ]);
  } else {
    const existingUsers = await userModel.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log('   Run with --refresh to drop and reseed: npm run seed:refresh\n');
      await app.close();
      process.exit(0);
    }
  }

  // ── Users ────────────────────────────────────
  console.log('👤 Seeding users...');
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const users = await userModel.insertMany([
    {
      email: 'admin@Bfotool.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      avatar: 'https://picsum.photos/seed/admin/200/200',
      bio: 'Platform administrator and lead editor.',
    },
    {
      email: 'sarah.chen@Bfotool.com',
      password: hashedPassword,
      name: 'Sarah Chen',
      role: UserRole.AUTHOR,
      avatar: 'https://picsum.photos/seed/sarah/200/200',
      bio: 'Full-stack developer with 8 years of experience. Passionate about Vue, TypeScript, and scalable applications.',
    },
    {
      email: 'marcus.rivera@Bfotool.com',
      password: hashedPassword,
      name: 'Marcus Rivera',
      role: UserRole.AUTHOR,
      avatar: 'https://picsum.photos/seed/marcus/200/200',
      bio: 'DevOps engineer and cloud architect. Writes about infrastructure, CI/CD, and shipping software reliably.',
    },
    {
      email: 'lena.kowalski@Bfotool.com',
      password: hashedPassword,
      name: 'Lena Kowalski',
      role: UserRole.AUTHOR,
      avatar: 'https://picsum.photos/seed/lena/200/200',
      bio: 'UX designer turned frontend engineer. Bridging the gap between beautiful design and clean code.',
    },
    {
      email: 'reader@Bfotool.com',
      password: hashedPassword,
      name: 'John Reader',
      role: UserRole.READER,
      avatar: 'https://picsum.photos/seed/reader/200/200',
      bio: 'Avid blog reader and aspiring developer.',
    },
  ]);

  console.log(`  ✅ Created ${users.length} users`);

  // ── Categories ───────────────────────────────
  console.log('📂 Seeding categories...');
  const categories = await categoryModel.insertMany([
    { name: 'Web Development', slug: 'web-development', description: 'Frontend and backend tutorials, best practices, and deep dives.' },
    { name: 'Design', slug: 'design', description: 'UI/UX design principles, design systems, and accessibility.' },
    { name: 'DevOps', slug: 'devops', description: 'CI/CD, cloud infrastructure, and deployment strategies.' },
    { name: 'AI & Machine Learning', slug: 'ai-machine-learning', description: 'AI integration, ML models, and intelligent applications.' },
    { name: 'Career', slug: 'career', description: 'Career advice, interviews, remote work, and industry navigation.' },
  ]);

  console.log(`  ✅ Created ${categories.length} categories`);

  // ── Tags ─────────────────────────────────────
  console.log('🏷️  Seeding tags...');
  const tagNames = [
    'Vue', 'TypeScript', 'Architecture', 'Performance', 'CSS', 'Grid',
    'Layout', 'Design Systems', 'UI', 'Docker', 'Kubernetes', 'Cloud',
    'AI', 'Web Development', 'APIs', 'Machine Learning', 'Remote Work',
    'Productivity', 'Career', 'Accessibility', 'NestJS', 'MongoDB',
    'Node.js', 'Testing', 'CI/CD', 'React', 'Next.js', 'Nuxt',
  ];

  const tags = await tagModel.insertMany(
    tagNames.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/&/g, 'and'),
    })),
  );

  console.log(`  ✅ Created ${tags.length} tags`);

  // Helper to get tag IDs by names
  const getTagIds = (names: string[]) =>
    tags.filter((t) => names.includes(t.name)).map((t) => t._id);

  // ── Posts ────────────────────────────────────
  console.log('📝 Seeding posts...');
  const postsData = [
    {
      title: 'Building Scalable Vue Applications in 2025',
      slug: 'building-scalable-vue-applications-2025',
      excerpt: 'A comprehensive guide to structuring large-scale Vue projects with modern tools and best practices.',
      content: '## Introduction\n\nBuilding a Vue application is easy. Building one that scales to hundreds of components, dozens of developers, and millions of users — that\'s the real challenge.\n\n## Project Structure\n\nThe key to a scalable project is a clear, predictable folder structure. We recommend the feature-based approach over traditional type-based structure.\n\n## State Management with Pinia\n\nPinia is the official state management solution for Vue 3. It\'s type-safe, supports devtools, and has a simple API.\n\n## Performance Optimization\n\nVue 3 is fast out of the box, but there are patterns to follow. Use lazy loading for routes. Leverage Suspense for async components. Use shallowRef for large objects.\n\n## Conclusion\n\nScalability is not about choosing the right framework — it\'s about making consistent, thoughtful decisions at every level.',
      coverImage: 'https://picsum.photos/seed/vue-scale/1200/630',
      author: users[1]._id,
      category: categories[0]._id,
      tags: getTagIds(['Vue', 'Architecture', 'TypeScript', 'Performance']),
      status: PostStatus.PUBLISHED,
      readingTime: 8,
      featured: true,
    },
    {
      title: 'Mastering CSS Grid: From Basics to Advanced Layouts',
      slug: 'mastering-css-grid-layouts',
      excerpt: 'Learn how CSS Grid can transform your layout workflow with practical examples.',
      content: '## Why CSS Grid?\n\nFlexbox is great for one-dimensional layouts. CSS Grid handles both rows and columns simultaneously.\n\n## The Fundamentals\n\nEvery grid starts with a container using display: grid. The fr unit represents a fraction of available space.\n\n## Named Grid Areas\n\nOne of the most powerful features is named template areas — they read almost like a visual blueprint.\n\n## Responsive Without Media Queries\n\nUsing auto-fit with minmax() creates responsive layouts without a single media query.\n\n## Conclusion\n\nCSS Grid is a paradigm shift in how we think about web layouts.',
      coverImage: 'https://picsum.photos/seed/css-grid/1200/630',
      author: users[3]._id,
      category: categories[0]._id,
      tags: getTagIds(['CSS', 'Grid', 'Layout']),
      status: PostStatus.PUBLISHED,
      readingTime: 6,
      featured: false,
    },
    {
      title: 'Building a Design System from Scratch',
      slug: 'design-systems-from-scratch',
      excerpt: 'Design systems are more than component libraries. Learn how to build one that gets adopted.',
      content: '## What Is a Design System?\n\nA design system is a collection of reusable components guided by clear standards.\n\n## Start with Tokens\n\nDesign tokens capture decisions as data — colors, spacing, typography.\n\n## Component API Design\n\nA good API is consistent, composable, accessible, and fully typed.\n\n## Documentation Is Not Optional\n\nInvest in interactive documentation with live examples.\n\n## Conclusion\n\nStart small, iterate based on feedback. The goal is consistency, not perfection.',
      coverImage: 'https://picsum.photos/seed/design-sys/1200/630',
      author: users[3]._id,
      category: categories[1]._id,
      tags: getTagIds(['Design Systems', 'UI']),
      status: PostStatus.PUBLISHED,
      readingTime: 7,
      featured: true,
    },
    {
      title: 'Docker to Kubernetes: A Production-Ready Journey',
      slug: 'docker-kubernetes-production',
      excerpt: 'From a single Docker container to fully orchestrated Kubernetes deployment.',
      content: '## The Container Revolution\n\nContainers changed how we ship software. But production is different from local development.\n\n## Docker Basics Revisited\n\nMulti-stage builds keep your production image lean and secure.\n\n## Why Kubernetes?\n\nKubernetes provides service discovery, load balancing, automated rollouts, self-healing, and horizontal scaling.\n\n## Monitoring and Observability\n\nThe three pillars: Metrics, Logs, and Traces.\n\n## Conclusion\n\nStart with a solid Docker foundation, learn Kubernetes incrementally.',
      coverImage: 'https://picsum.photos/seed/docker-k8s/1200/630',
      author: users[2]._id,
      category: categories[2]._id,
      tags: getTagIds(['Docker', 'Kubernetes', 'Cloud']),
      status: PostStatus.PUBLISHED,
      readingTime: 10,
      featured: false,
    },
    {
      title: 'Integrating AI Into Your Web Applications',
      slug: 'ai-powered-web-apps',
      excerpt: 'Practical ways to add AI capabilities to your web projects without a PhD.',
      content: '## AI Is Not Just for Data Scientists\n\nThe barrier to entry has never been lower.\n\n## Practical AI Features\n\nIntelligent search, content generation, smart forms, and chatbots.\n\n## Architecture Patterns\n\nKeep AI calls server-side. Implement streaming. Cache aggressively. Have fallback behavior.\n\n## Cost Management\n\nCache common queries, use smaller models for simple tasks, implement rate limiting.\n\n## Conclusion\n\nAI is a tool, not a magic wand. The best features solve real user problems.',
      coverImage: 'https://picsum.photos/seed/ai-web/1200/630',
      author: users[1]._id,
      category: categories[3]._id,
      tags: getTagIds(['AI', 'Web Development', 'APIs', 'Machine Learning']),
      status: PostStatus.PUBLISHED,
      readingTime: 7,
      featured: true,
    },
    {
      title: 'NestJS with MongoDB: Building Professional APIs',
      slug: 'nestjs-mongodb-professional-apis',
      excerpt: 'Learn how to build production-grade REST APIs with NestJS and MongoDB.',
      content: '## Why NestJS?\n\nNestJS provides a structured, opinionated framework built on top of Express with full TypeScript support.\n\n## MongoDB with Mongoose\n\nMongoose provides schema validation, middleware, and a powerful query API.\n\n## Authentication with JWT\n\nImplement access and refresh token patterns for secure authentication.\n\n## Swagger Documentation\n\nAuto-generate API docs from your decorators.\n\n## Conclusion\n\nNestJS and MongoDB make a powerful combination for modern APIs.',
      coverImage: 'https://picsum.photos/seed/nestjs/1200/630',
      author: users[1]._id,
      category: categories[0]._id,
      tags: getTagIds(['NestJS', 'MongoDB', 'Node.js', 'TypeScript']),
      status: PostStatus.PUBLISHED,
      readingTime: 9,
      featured: false,
    },
    {
      title: 'CI/CD Pipelines: Best Practices for Modern Teams',
      slug: 'cicd-pipelines-best-practices',
      excerpt: 'Build CI/CD pipelines that catch bugs early and ship code reliably.',
      content: '## The Goal: Confidence\n\nGive your team confidence that every change is safe to deploy.\n\n## Continuous Integration\n\nLinting, type checking, tests, build verification, security scanning.\n\n## Pipeline Design\n\nValidation, Build, Testing, Deployment — structured in stages.\n\n## Conclusion\n\nA great pipeline is invisible when things go well, invaluable when things go wrong.',
      coverImage: 'https://picsum.photos/seed/cicd/1200/630',
      author: users[2]._id,
      category: categories[2]._id,
      tags: getTagIds(['CI/CD', 'Testing']),
      status: PostStatus.PUBLISHED,
      readingTime: 7,
      featured: false,
    },
    {
      title: 'Web Accessibility: Building for Everyone',
      slug: 'accessibility-web-guide',
      excerpt: 'Accessibility is a fundamental requirement. Build inclusive experiences from day one.',
      content: '## Why Accessibility Matters\n\nOver 1 billion people worldwide have some form of disability.\n\n## The POUR Principles\n\nPerceivable, Operable, Understandable, Robust.\n\n## Quick Wins\n\nSemantic HTML, alt text, color contrast, keyboard access, heading hierarchy.\n\n## Testing\n\nUse axe DevTools, keyboard testing, screen readers, and user testing.\n\n## Conclusion\n\nAccessibility is a mindset, not a checkbox.',
      coverImage: 'https://picsum.photos/seed/a11y/1200/630',
      author: users[3]._id,
      category: categories[1]._id,
      tags: getTagIds(['Accessibility', 'Web Development']),
      status: PostStatus.PUBLISHED,
      readingTime: 8,
      featured: false,
    },
    {
      title: 'The Developer Guide to Thriving in Remote Work',
      slug: 'remote-work-developer-guide',
      excerpt: 'Habits, tools, and mindset shifts for productive remote development.',
      content: '## Setting Up Your Environment\n\nInvest in good equipment. Have boundaries between work and living space.\n\n## Communication\n\nOver-communicate asynchronously. Write things down. Default to written updates.\n\n## Deep Work\n\nBlock 2-3 hours of uninterrupted time daily.\n\n## Avoiding Burnout\n\nSet hard start/stop times. Take real breaks. Exercise regularly.\n\n## Conclusion\n\nRemote work is a skill, not a setting.',
      coverImage: 'https://picsum.photos/seed/remote-work/1200/630',
      author: users[2]._id,
      category: categories[4]._id,
      tags: getTagIds(['Remote Work', 'Productivity', 'Career']),
      status: PostStatus.PUBLISHED,
      readingTime: 6,
      featured: false,
    },
    {
      title: 'Draft: Advanced Testing Strategies',
      slug: 'advanced-testing-strategies-draft',
      excerpt: 'A deep dive into testing strategies for modern applications.',
      content: '## Coming Soon\n\nThis post is currently being written.\n\n## Topics Planned\n\nUnit testing, integration testing, E2E testing, contract testing.',
      coverImage: 'https://picsum.photos/seed/testing/1200/630',
      author: users[1]._id,
      category: categories[0]._id,
      tags: getTagIds(['Testing', 'TypeScript']),
      status: PostStatus.DRAFT,
      readingTime: 5,
      featured: false,
    },
  ];

  const posts = await postModel.insertMany(postsData);
  console.log(`  ✅ Created ${posts.length} posts`);

  // ── Comments ─────────────────────────────────
  console.log('💬 Seeding comments...');
  const comments = await commentModel.insertMany([
    {
      content: 'Excellent article! The feature-based structure really helped our team scale our Vue app.',
      author: users[4]._id,
      post: posts[0]._id,
      parentComment: null,
    },
    {
      content: 'Thanks for sharing! Do you have recommendations for state management at enterprise scale?',
      author: users[2]._id,
      post: posts[0]._id,
      parentComment: null,
    },
    {
      content: 'CSS Grid has been a game changer for me. No more float hacks!',
      author: users[4]._id,
      post: posts[1]._id,
      parentComment: null,
    },
    {
      content: 'Great primer on Docker and K8s. Would love a follow-up on Helm charts.',
      author: users[1]._id,
      post: posts[3]._id,
      parentComment: null,
    },
    {
      content: 'The AI integration patterns are very practical. Already implementing the caching strategy.',
      author: users[3]._id,
      post: posts[4]._id,
      parentComment: null,
    },
  ]);

  // Add a reply
  await commentModel.create({
    content: 'Absolutely! Pinia with composition API stores works great at scale. I\'ll cover it in a future post.',
    author: users[1]._id,
    post: posts[0]._id,
    parentComment: comments[1]._id,
  });

  console.log(`  ✅ Created ${comments.length + 1} comments`);

  // ── Done ─────────────────────────────────────
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials (all users):');
  console.log('  Admin:  admin@Bfotool.com / admin123');
  console.log('  Author: sarah.chen@Bfotool.com / admin123');
  console.log('  Author: marcus.rivera@Bfotool.com / admin123');
  console.log('  Author: lena.kowalski@Bfotool.com / admin123');
  console.log('  Reader: reader@Bfotool.com / admin123\n');

  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
