# Feature: Profiles & Reputation

**Status:** Forward-looking spec — currently no `Rating` model in schema

## User stories & acceptance criteria
**As a buyer**, I want to see a seller's rating so that **I can trust them with my transaction.**

**As a seller**, I want to build my reputation so that **I can sell more items.**

Acceptance criteria:
- [ ] User profile displays rating statistics (average score, total reviews)
- [ ] Users can leave ratings after a completed transaction
- [ ] Ratings are aggregated and displayed publicly

## Data model
No `Rating` model exists in `prisma/schema.prisma` yet. Refer to `docs/functional/ratings.md` for the planned structure.

## Edge cases
- What happens when a user has no ratings yet?
- Can users modify or delete their ratings after posting?

## Open questions
- Should ratings be visible immediately or only after order completion?
- What are the allowed rating ranges (1–5, 1–10)?
