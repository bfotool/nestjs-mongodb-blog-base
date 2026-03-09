# Bfotool Blog API — NestJS

A production-grade RESTful Blog API built with **NestJS 11**, **MongoDB** (Mongoose), **JWT Authentication**, and **Swagger/OpenAPI** documentation. Includes full CRUD for posts, categories, tags, comments, users, role-based access control, and a database seeding system.

![nestjs-mongo-base-api](nest-mongo-api.png)

![NestJS](https://img.shields.io/badge/NestJS-11-ea2845?logo=nestjs)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3-85EA2D?logo=swagger)
![JWT](https://img.shields.io/badge/Auth-JWT-000?logo=jsonwebtokens)

---

## Features

### Authentication & Authorization
- **JWT Access + Refresh Tokens** — Secure dual-token pattern
- **Role-Based Access Control (RBAC)** — Admin, Author, Reader roles
- **Password Hashing** — bcrypt with salt rounds
- **Protected Routes** — Guards on write operations
- **Token Refresh** — Seamless access token renewal

### Modules

| Module | Endpoints | Auth Required |
|---|---|---|
| **Auth** | `POST register`, `POST login`, `POST refresh`, `POST logout`, `GET profile` | Login/Register: No, Others: Yes |
| **Users** | `GET all`, `GET :id`, `PATCH :id`, `DELETE :id` | Read: No, Write: Admin |
| **Posts** | `GET all`, `GET featured`, `GET :slug`, `POST`, `PATCH :id`, `DELETE :id` | Read: No, Write: Author/Admin |
| **Categories** | `GET all`, `GET :slug`, `POST`, `PATCH :id`, `DELETE :id` | Read: No, Write: Author/Admin |
| **Tags** | `GET all`, `GET :slug`, `POST`, `PATCH :id`, `DELETE :id` | Read: No, Write: Author/Admin |
| **Comments** | `GET post/:postId`, `GET :id/replies`, `POST`, `PATCH :id`, `DELETE :id` | Read: No, Write: Logged in |

### API Features
- **Swagger/OpenAPI 3.0** docs at `/api/docs`
- **Pagination** on all list endpoints (page, limit)
- **Full-text Search** on posts (title, excerpt, content)
- **Filtering** — by category, tag, status, author
- **Sorting** — by date, title, reading time (asc/desc)
- **Input Validation** — class-validator with whitelist
- **Response Transformation** — consistent `{ success, data, timestamp }` wrapper
- **Error Handling** — global exception filter with structured errors
- **Auto-slug Generation** — from title using slugify
- **Reading Time Calculation** — auto-computed from content
- **Nested Comments** — parent/reply threading

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript 5.7 (strict) |
| Database | MongoDB 8 + Mongoose 8 |
| Auth | Passport.js + JWT (access + refresh) |
| Validation | class-validator + class-transformer |
| API Docs | @nestjs/swagger (OpenAPI 3) |
| Password | bcrypt |
| Slugs | slugify |
| Testing | Jest |

---

## Project Structure

```
src/
├── main.ts                          # Bootstrap + Swagger setup
├── app.module.ts                    # Root module
│
├── auth/                            # Authentication module
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── dto/auth.dto.ts
│   ├── strategies/jwt.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── optional-jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       ├── roles.decorator.ts
│       └── current-user.decorator.ts
│
├── users/                           # Users module
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── dto/user.dto.ts
│   └── schemas/user.schema.ts
│
├── posts/                           # Posts module
│   ├── posts.module.ts
│   ├── posts.service.ts
│   ├── posts.controller.ts
│   ├── dto/post.dto.ts
│   └── schemas/post.schema.ts
│
├── categories/                      # Categories module
│   ├── categories.module.ts
│   ├── categories.service.ts
│   ├── categories.controller.ts
│   ├── dto/category.dto.ts
│   └── schemas/category.schema.ts
│
├── tags/                            # Tags module
│   ├── tags.module.ts
│   ├── tags.service.ts
│   ├── tags.controller.ts
│   ├── dto/tag.dto.ts
│   └── schemas/tag.schema.ts
│
├── comments/                        # Comments module
│   ├── comments.module.ts
│   ├── comments.service.ts
│   ├── comments.controller.ts
│   ├── dto/comment.dto.ts
│   └── schemas/comment.schema.ts
│
├── common/                          # Shared utilities
│   ├── dto/pagination.dto.ts
│   ├── filters/http-exception.filter.ts
│   └── interceptors/transform.interceptor.ts
│
└── seed/
    └── seed.ts                      # Database seeding script
```

---

## Getting Started

### Prerequisites
- **Node.js** 18.17+
- **MongoDB** 6+ (local or Atlas)
- npm, yarn, or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/bfotool/nestjs-blog-api.git
cd nestjs-blog-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# Seed the database with sample data
npm run seed

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`.

Swagger docs at `http://localhost:3000/api/docs`.

### Available Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start with hot reload |
| `npm run start:debug` | Start with debugger |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run seed` | Seed database with sample data |
| `npm run seed:refresh` | Drop all data and re-seed |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:cov` | Run tests with coverage |

---

## Database Seeding

The seed command populates your MongoDB with sample data:

```bash
# Seed (additive — won't duplicate if run again on empty DB)
npm run seed

# Refresh — drops ALL data and re-seeds
npm run seed:refresh
```

### Seeded Data

| Entity | Count | Details |
|---|---|---|
| Users | 5 | 1 admin, 3 authors, 1 reader |
| Categories | 5 | Web Dev, Design, DevOps, AI/ML, Career |
| Tags | 28 | Vue, TypeScript, Docker, etc. |
| Posts | 10 | 9 published, 1 draft, 3 featured |
| Comments | 6 | Including 1 nested reply |

### Login Credentials

All seeded users use the same password: `admin123`

| Role | Email |
|---|---|
| Admin | `admin@Bfotool.com` |
| Author | `sarah.chen@Bfotool.com` |
| Author | `marcus.rivera@Bfotool.com` |
| Author | `lena.kowalski@Bfotool.com` |
| Reader | `reader@Bfotool.com` |

---

## Authentication Flow

### 1. Register
```bash
POST /api/v1/auth/register
{ "email": "new@user.com", "password": "pass123", "name": "New User" }
```

### 2. Login
```bash
POST /api/v1/auth/login
{ "email": "admin@Bfotool.com", "password": "admin123" }
# Returns: { accessToken, refreshToken, user }
```

### 3. Use Access Token
```bash
GET /api/v1/auth/profile
Authorization: Bearer <accessToken>
```

### 4. Refresh Token
```bash
POST /api/v1/auth/refresh
Authorization: Bearer <accessToken>
{ "refreshToken": "<refreshToken>" }
```

### 5. Logout
```bash
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```

---

## API Examples

### Get Posts (paginated + filtered)
```bash
GET /api/v1/posts?page=1&limit=6&category=web-development&sortBy=createdAt&sortOrder=desc
```

### Search Posts
```bash
GET /api/v1/posts?search=vue+typescript
```

### Create Post (requires Author/Admin)
```bash
POST /api/v1/posts
Authorization: Bearer <token>
{
  "title": "My New Post",
  "excerpt": "A brief summary",
  "content": "## Full markdown content...",
  "category": "<categoryId>",
  "tags": ["Vue", "TypeScript"],
  "status": "published"
}
```

---

## Swagger

Interactive API documentation is available at:

```
http://localhost:3000/api/docs
```

Features include "Try it out" on every endpoint, JWT authentication via "Authorize" button, and request/response schemas auto-generated from DTOs.

---

## License

MIT
