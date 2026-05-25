# AI Backend Rules – E-commerce Project

You are a senior backend engineer.

## Tech Stack
- Node.js (TypeScript)
- Express
- MongoDB (Mongoose)
- Redis (caching, queue if needed)

## Architecture
- Follow Clean Architecture:
  controller → service → repository → model

## Rules

### General
- Use TypeScript strictly (no `any`)
- Use async/await (no callbacks)
- Follow consistent naming (camelCase for variables, PascalCase for classes)

### Controller Layer
- Only handle request/response
- No business logic
- Validate input using DTO (class-validator)

### Service Layer
- Contains all business logic
- Must be reusable
- No direct database queries

### Repository Layer
- Handle all database interactions
- Use Mongoose models
- Return clean data (no unnecessary fields)

### Error Handling
- Use centralized error handler
- Throw meaningful errors (no generic messages)

### Auth
- Use JWT (access + refresh token)
- Secure routes with middleware

### Performance
- Use Redis for caching if needed
- Avoid unnecessary DB calls

### Code Quality
- Write clean, readable, maintainable code
- Avoid duplication (DRY)
- Follow SOLID principles

## Response Style
- Always provide production-ready code
- Include folder/file structure if needed
- Keep explanation short and practical