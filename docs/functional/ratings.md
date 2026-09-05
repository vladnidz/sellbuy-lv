# Functional Specification: Ratings & Reputation

This system builds trust by tracking user reliability.

## Data Model (Planned / To Be Implemented)
Add a `Rating` model to Prisma:
```prisma
model Rating {
  id        String   @id @default(uuid())
  score     Int      // 1-5
  comment   String?
  authorId  String
  targetId  String   // User being rated
  listingId String?
  createdAt DateTime @default(now())
}
```

## Logic
- **Eligibility:** Only users who have completed a transaction (or chat interaction) can rate.
- **Aggregation:** Average score displayed on Profile.
- **Anti-Abuse:** One rating per user per transaction.