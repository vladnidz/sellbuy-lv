# Data & Architecture Specification

## Overview
This document outlines the core data architecture for **SellBuy.lv**. It serves as the primary reference for all engineering agents and future maintainers.

## Database Schema (Prisma)
The database is PostgreSQL 17, leveraging the `ltree` extension for efficient category tree traversals.

```prisma
// See prisma/schema.prisma for the live source
model User {
  id       String    @id @default(uuid())
  email    String    @unique
  name     String?
  listings Listing[]
  chats    Chat[]
}

model Category {
  id         String               @id @default(uuid())
  name       String
  path       Unsupported("ltree") @unique // Ltree path for hierarchy
  parentId   String?
  parent     Category?            @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children   Category[]           @relation("CategoryHierarchy")
  listings   Listing[]

  @@index([path], type: Gist) // Gist index for ltree path queries
}

model Listing {
  id          String   @id @default(uuid())
  title       String
  price       Decimal
  categoryId  String
  authorId    String
  // ... (additional fields)
}

model Chat {
  id           String    @id @default(uuid())
  participants User[]
  messages     Message[]
}
```

## Architectural Workarounds & Technical Debt
To ensure system stability, the following pins are active as of 2026-09-05. **DO NOT REMOVE OR CHANGE THESE WITHOUT DOCUMENTING THE IMPACT.**

1.  **React 19 RC:** Currently pinned. Required for compatibility with our Next.js 16.3.1 setup.
2.  **Webpack Build Engine (`--webpack`):** Forced in `package.json` build script.
    *   *Reason:* Turbopack incorrectly parses Tailwind v4 arbitrary property syntax (e.g., `.[--card-spacing:--spacing(4)]`).
    *   *Remediation:* Re-evaluate only after Tailwind/Turbopack compatibility updates.
3.  **Standalone Output:** Used in `next.config.ts`. Combined with the above, this is required for Vercel deployment stability.
