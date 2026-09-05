# FEATURE: Ratings & Reputation

**Status:** Planned / To Be Implemented

## User stories & acceptance criteria
**As a buyer**, I need to rate a seller so that **other buyers can see trusted, reliable sellers.**

**As a seller**, I need to see my rating score so that **my reputation builds and attracts more buyers.**

Acceptance criteria:
- [ ] A `Rating` model is added to `prisma/schema.prisma`
- [ ] Users can rate after a successful transaction
- [ ] Ratings are stored as an integer (1–5) with optional comments
- [ ] Average rating is calculated and displayed on user profiles
- [ ] One rating per user per transaction (anti-abuse)

## Data model
Reference the live schema: `prisma/schema.prisma` — currently no `Rating` model exists.

## Edge cases
- What happens if a user tries to rate the same transaction twice?
- Can a user rate themselves (self-rating)?
- Should we require a minimum number of completed transactions before allowing ratings?

## Open questions
- Should ratings be publicly visible or private by default?
- Should we implement a "buyer protection" rating (does the seller ship? is it as described?)
