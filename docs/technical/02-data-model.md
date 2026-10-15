# 02 — Data model

Status: Draft · Owner: tech lead · Last change: 15 Oct 2026

Written as Prisma models for PostgreSQL 17. Names are the source of truth for `packages/db/prisma/schema.prisma`. Where a field is a PostgreSQL-only type (`ltree`, `tsvector`), the migration adds it with raw SQL and the Prisma model marks it `Unsupported`.

## 1. Conventions

- Primary keys: `id String @id @db.Uuid` generated as UUIDv7 in the application (time-sortable).
- Timestamps: `createdAt`, `updatedAt` (UTC). Soft-deleted rows use `deletedAt` only where stated.
- Money: `Int` in minor units (cents) for listings, orders, offers, and bids. Ledger amounts use `BigInt`. Currency is `String` (ISO 4217) and defaults to `EUR`.
- Enums are PostgreSQL enums with upper-case values.
- Localised text: `nameLv`, `nameRu`, `nameEn` for catalogue entities. User-generated text is stored once in its original language, with `language` set.
- Personal data is marked `// PII` and must follow `07-security-privacy.md`.
- Every table that records a state change has a matching row in `AuditEvent` written in the same transaction (for money, auctions, moderation, and staff actions).

## 2. Enums

```prisma
enum VerificationLevel { L0 L1 L2 L3 }
enum UserStatus { ACTIVE RESTRICTED SUSPENDED BANNED PENDING_DELETION DELETED }
enum ListingStatus { DRAFT PENDING_REVIEW ACTIVE RESERVED SOLD EXPIRED REMOVED ARCHIVED }
enum PriceType { FIXED NEGOTIABLE FREE }
enum ListingCondition { NEW LIKE_NEW GOOD FAIR FOR_PARTS }
enum OfferStatus { OPEN ACCEPTED DECLINED COUNTERED EXPIRED WITHDRAWN }
enum AuctionStatus { SCHEDULED LIVE CLOSING CLOSED NO_BIDS RESERVE_NOT_MET SECOND_CHANCE WON PAID COMPLETED ENDED CANCELLED }
enum BidStatus { ACCEPTED OUTBID RETRACTED REMOVED WINNING }
enum OrderStatus { AWAITING_PAYMENT PAID HANDOVER_PENDING SHIPPED DELIVERED CONFIRMED RELEASED DISPUTED REFUNDED CANCELLED EXPIRED }
enum DisputeStatus { OPEN SELLER_RESPONSE REVIEW DECIDED APPEALED CLOSED }
enum PaymentStatus { PENDING SUCCEEDED FAILED CANCELLED REFUNDED PARTIALLY_REFUNDED CHARGEBACK }
enum PayoutStatus { SCHEDULED PROCESSING PAID FAILED ON_HOLD CANCELLED }
enum ShipmentStatus { LABEL_CREATED IN_TRANSIT OUT_FOR_DELIVERY READY_FOR_PICKUP DELIVERED RETURNED LOST }
enum CarrierCode { OMNIVA DPD LATVIJAS_PASTS OTHER }
enum ReportStatus { OPEN TRIAGED ACTIONED DISMISSED }
enum ModerationStatus { QUEUED IN_REVIEW DECIDED CLOSED }
enum Severity { LOW MEDIUM HIGH CRITICAL }
enum EnforcementType { WARNING LISTING_REMOVED RESTRICTED SUSPENDED BANNED }
enum PromotionType { HIGHLIGHT TOP_OF_CATEGORY FEATURED }
enum CompanyRole { OWNER MANAGER EDITOR VIEWER }
enum NotificationChannel { IN_APP EMAIL PUSH SMS }
enum FeeType { PLATFORM_FEE BUYER_PREMIUM SELLER_FEE PROMOTION VAT_ON_FEE }
enum VatTreatment { STANDARD REVERSE_CHARGE MARGIN_SCHEME EXEMPT }
enum TemplateKey { GEN DEV PHONE PC PERIPH AV CAM GAME APP_H FURN APPAREL SHOE JEWEL KIDS KIDS_APP TOY SPORT SPORT_FIT COLL MEDIA BOOK INST INST_PRO BEAUTY_DEV BEAUTY MED_AID PET ANTIQUE BIZ BIZ_HEAVY BIZ_MED LOT VEH VEH_2W VEH_COM VEH_TR BOAT BIKE PART }
```

## 3. Identity and access

```prisma
model User {
  id               String            @id @db.Uuid
  displayName      String            @db.VarChar(30)
  locale           String            @default("lv") // lv | ru | en
  verificationLevel VerificationLevel @default(L0)
  status           UserStatus        @default(ACTIVE)
  emailVerifiedAt  DateTime?
  phoneVerifiedAt  DateTime?
  smartIdVerifiedAt DateTime?
  primaryEmail     String?           @db.VarChar(254) // PII, encrypted at rest
  primaryPhone     String?           @db.VarChar(20)  // PII, E.164, encrypted at rest
  givenName        String?           // PII, shown only with consent
  familyName       String?           // PII, shown only with consent
  sellerScore      Decimal?          @db.Decimal(3, 2)
  reviewCount      Int               @default(0)
  activeListings   Int               @default(0)   // denormalised counter, reconciled nightly
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  deletionRequestedAt DateTime?
  identities       Identity[]
  sessions         Session[]
  consents         ConsentRecord[]
  listings         Listing[]
  companyMembers   CompanyMember[]
  blocksOut        Block[]           @relation("blocker")
  blocksIn         Block[]           @relation("blocked")
  notificationPrefs NotificationPreference?
  @@index([status])
  @@index([verificationLevel])
}

model Identity {
  id             String   @id @db.Uuid
  userId         String   @db.Uuid
  provider       String   // SMART_ID | PHONE | EMAIL
  subjectHash    String   // keyed HMAC of personal code, phone, or email; never plain text
  createdAt      DateTime @default(now())
  revokedAt      DateTime?
  user           User     @relation(fields: [userId], references: [id])
  @@unique([provider, subjectHash])
  @@index([userId])
}

model Session {
  id              String    @id @db.Uuid
  userId          String    @db.Uuid
  tokenHash       String    @unique      // SHA-256 of session token
  deviceName      String?
  deviceFingerprintHash String?
  ipPrefix        String?                // first three octets or /48, not full IP
  city            String?
  createdAt       DateTime  @default(now())
  lastSeenAt      DateTime  @default(now())
  expiresAt       DateTime               // idle timeout applied on refresh
  absoluteExpiresAt DateTime
  revokedAt       DateTime?
  isStaff         Boolean   @default(false)
  user            User      @relation(fields: [userId], references: [id])
  @@index([userId, revokedAt])
}

model Block {
  blockerId  String   @db.Uuid
  blockedId  String   @db.Uuid
  createdAt  DateTime @default(now())
  blocker    User     @relation("blocker", fields: [blockerId], references: [id])
  blocked    User     @relation("blocked", fields: [blockedId], references: [id])
  @@id([blockerId, blockedId])
}

model ConsentRecord {
  id          String   @id @db.Uuid
  userId      String   @db.Uuid
  purpose     String   // TERMS | PRIVACY | MARKETING | ANALYTICS | PHONE_REVEAL | ...
  version     String   // document version key, for example legal.terms.v1
  granted     Boolean
  source      String   // SIGNUP | SETTINGS | BANNER
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  @@index([userId, purpose])
}

model VerificationRecord {
  id         String            @id @db.Uuid
  userId     String            @db.Uuid
  level      VerificationLevel
  method     String            // SMART_ID | PHONE | EMAIL | COMPANY_REGISTER | VIES | MANUAL
  result     String            // PASSED | FAILED | PENDING
  reviewerId String?           @db.Uuid
  evidence   Json?             // references only; no raw identity documents in this table
  createdAt  DateTime          @default(now())
  @@index([userId, createdAt])
}
```

## 4. Companies, members, and integrations

```prisma
model CompanyAccount {
  id                String   @id @db.Uuid
  legalName         String
  tradingName       String?
  registrationNumber String  @unique      // Latvian company number
  vatNumber         String?  @unique
  registeredAddress Json                  // structured address
  verificationStatus String  @default("PENDING") // PENDING | VERIFIED | REJECTED
  storefrontEnabled Boolean  @default(false)
  planCode          String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  members           CompanyMember[]
  listings          Listing[]
  apiKeys           ApiKey[]
  webhooks          WebhookSubscription[]
}

model CompanyMember {
  id         String      @id @db.Uuid
  companyId  String      @db.Uuid
  userId     String      @db.Uuid
  role       CompanyRole
  invitedAt  DateTime    @default(now())
  acceptedAt DateTime?
  removedAt  DateTime?
  company    CompanyAccount @relation(fields: [companyId], references: [id])
  user       User           @relation(fields: [userId], references: [id])
  @@unique([companyId, userId])
}

model ApiKey {
  id          String    @id @db.Uuid
  companyId   String    @db.Uuid
  name        String
  keyPrefix   String    // first 8 characters, displayed
  keyHash     String    @unique
  scopes      String[]  // for example feed:read, listings:write
  createdById String    @db.Uuid
  lastUsedAt  DateTime?
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())
  company     CompanyAccount @relation(fields: [companyId], references: [id])
}

model WebhookSubscription {
  id         String   @id @db.Uuid
  companyId  String   @db.Uuid
  url        String
  events     String[]
  secretRef  String   // reference in the secrets manager, never the secret itself
  active     Boolean  @default(true)
  createdAt  DateTime @default(now())
  company    CompanyAccount @relation(fields: [companyId], references: [id])
}
```

## 5. Catalogue

```prisma
model Category {
  id          String   @id @db.Uuid
  code        String   @unique          // C02.01.01
  path        Unsupported("ltree")      // C02_01_01 (ltree labels cannot contain dots; code C02.01.01 is kept in `code`)
  parentCode  String?
  level       Int                       // 1 root, 2 subcategory, 3 leaf
  nameLv      String
  nameRu      String
  nameEn      String
  aliases     String[]                  // searchable synonyms in all three languages
  templateKey TemplateKey
  allowedPriceTypes PriceType[]
  auctionEligible Boolean @default(false)
  escrowEligible  Boolean @default(false)
  parcelShippable Boolean @default(false)
  freightOnly     Boolean @default(false)
  documentsRequired Boolean @default(false)
  restrictedLevel VerificationLevel?    // L2 or L3 where restricted
  businessOnly    Boolean @default(false)
  hygieneSensitive Boolean @default(false)
  prohibited      Boolean @default(false)
  releaseTag      String   @default("R1")
  status          String   @default("ACTIVE") // ACTIVE | RETIRED
  redirectToCode  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  attributes      AttributeDefinition[]
  listings        Listing[]
  @@index([parentCode])
}
// Migration: GIST index on path; B-tree on code.

model AttributeDefinition {
  id          String   @id @db.Uuid
  templateKey TemplateKey
  key         String   // for example "storage_gb"
  label_lv    String
  label_ru    String
  label_en    String
  dataType    String   // ENUM | NUMBER | RANGE | BOOLEAN | TEXT | DATE | YEAR | MEASURE | MULTI_ENUM | ATTACHMENT | CATALOG
  unit        String?
  required    Boolean  @default(false)
  filterable  Boolean  @default(false)
  visibility  String   @default("PUBLIC") // PUBLIC | PRIVATE | BUYER_IN_CONVERSATION | MODERATOR
  requiredForLevels VerificationLevel[]
  version     Int      @default(1)
  active      Boolean  @default(true)
  options     AttributeOption[]
  categoryCodes String[] // optional scope to leaves
  @@unique([templateKey, key, version])
}

model AttributeOption {
  id           String @id @db.Uuid
  attributeId  String @db.Uuid
  value        String
  label_lv     String
  label_ru     String
  label_en     String
  sortOrder    Int    @default(0)
  active       Boolean @default(true)
  attribute    AttributeDefinition @relation(fields: [attributeId], references: [id])
  @@unique([attributeId, value])
}

model Brand {
  id           String   @id @db.Uuid
  name         String
  normalised   String   @unique          // lowercased, diacritics removed
  families     String[]                  // which families use this brand
  status       String   @default("SEED") // SEED | CURATED | UNVERIFIED | RETIRED
  createdAt    DateTime @default(now())
  models       ProductModel[]
}

model ProductModel {
  id           String   @id @db.Uuid
  brandId      String   @db.Uuid
  name         String   // as published by the manufacturer
  normalised   String
  family       String
  yearFrom     Int?
  yearTo       Int?
  status       String   @default("SEED")
  brand        Brand    @relation(fields: [brandId], references: [id])
  @@unique([brandId, normalised, family])
}
```

## 6. Listings

```prisma
model Listing {
  id               String        @id @db.Uuid
  sellerId         String        @db.Uuid
  companyId        String?       @db.Uuid
  categoryCode     String
  categoryPath     Unsupported("ltree")   // copy of category path for subtree search
  templateKey      TemplateKey
  status           ListingStatus @default(DRAFT)
  title            String        @db.VarChar(80)
  description      String        @db.VarChar(4000)  // plain text only
  language         String        @default("lv")
  priceType        PriceType     @default(FIXED)
  priceAmount      Int?          // minor units; null for negotiable and free
  currency         String        @default("EUR")
  vatIncluded      Boolean?      // business listings only
  condition        ListingCondition?
  quantity         Int           @default(1)
  locationCity     String
  locationDistrict String?
  approxLat        Decimal?      @db.Decimal(9, 6) // randomised within ~500 m
  approxLng        Decimal?      @db.Decimal(9, 6)
  pickupPoint      String?
  deliveryOptions  String[]      // PICKUP | PARCEL | FREIGHT
  offersEnabled    Boolean       @default(true)
  expiresAt        DateTime?
  publishedAt      DateTime?
  bumpedAt         DateTime?
  soldAt           DateTime?
  archivedAt       DateTime?
  removedAt        DateTime?
  removalReasonCode String?
  qualityScore     Int           @default(0)
  searchVector     Unsupported("tsvector")?   // maintained by trigger; see 06-search.md
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  seller           User          @relation(fields: [sellerId], references: [id])
  company          CompanyAccount? @relation(fields: [companyId], references: [id])
  category         Category      @relation(fields: [categoryCode], references: [code])
  attributeValues  ListingAttributeValue[]
  images           ListingImage[]
  versions         ListingVersion[]
  conversations    Conversation[]
  offers           Offer[]
  auction          Auction?
  orders           Order[]
  favourites       Favourite[]
  reports          Report[]
  promotions       Promotion[]
  @@index([status, categoryCode, publishedAt])
  @@index([sellerId, status])
  @@index([expiresAt])
}
// Migration: partial index on status = ACTIVE for search; GIN index on searchVector.

model ListingAttributeValue {
  listingId   String @db.Uuid
  attributeId String @db.Uuid
  valueText   String?
  valueNumber Decimal? @db.Decimal(14, 4)
  valueBool   Boolean?
  valueDate   DateTime? @db.Date
  valueOption String?
  valueFreeMulti String[]
  listing     Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  attribute   AttributeDefinition @relation(fields: [attributeId], references: [id])
  @@id([listingId, attributeId])
  @@index([attributeId, valueOption])
  @@index([attributeId, valueNumber])
}

model ListingImage {
  id            String   @id @db.Uuid
  listingId     String   @db.Uuid
  position      Int
  status        String   @default("UPLOADED") // UPLOADED | PROCESSING | READY | REJECTED
  originalKey   String   // private bucket
  variantKeys   Json     // { thumb, card, full, avif, webp }
  width         Int?
  height        Int?
  bytes         Int
  mimeType      String
  phash         String?  // perceptual hash for duplicate detection
  safetyScore   Decimal? @db.Decimal(4, 3)
  exifStrippedAt DateTime?
  rejectionReason String?
  createdAt     DateTime @default(now())
  listing       Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  @@index([listingId, position])
  @@index([phash])
}

model ListingVersion {
  id         String   @id @db.Uuid
  listingId  String   @db.Uuid
  version    Int
  snapshot   Json     // full content at version
  changedBy  String   @db.Uuid
  changeKind String   // CREATE | EDIT | PRICE | REPUBLISH | MODERATION
  createdAt  DateTime @default(now())
  listing    Listing  @relation(fields: [listingId], references: [id])
  @@unique([listingId, version])
}

model Favourite {
  userId    String   @db.Uuid
  listingId String   @db.Uuid
  createdAt DateTime @default(now())
  priceAtSave Int?
  @@id([userId, listingId])
}

model PriceObservation {
  id            String   @id @db.Uuid
  productKey    String   // canonical model key or attribute fingerprint
  categoryCode  String
  priceAmount   Int
  condition     ListingCondition?
  observedAt    DateTime
  source        String   // LISTING_ASKING | SOLD | AUCTION_HAMMER
  listingId     String?  @db.Uuid
  @@index([productKey, observedAt])
}
```

## 7. Search and alerts

```prisma
model SavedSearch {
  id          String   @id @db.Uuid
  userId      String   @db.Uuid
  name        String
  query       Json     // normalised query state (filters, sort, text)
  frequency   String   @default("INSTANT") // INSTANT | DAILY | WEEKLY | OFF
  lastRunAt   DateTime?
  createdAt   DateTime @default(now())
  @@index([userId])
}
```

## 8. Messaging and offers

```prisma
model Conversation {
  id           String   @id @db.Uuid
  listingId    String   @db.Uuid
  buyerId      String   @db.Uuid
  sellerId     String   @db.Uuid
  lastMessageAt DateTime?
  buyerArchived  Boolean @default(false)
  sellerArchived Boolean @default(false)
  buyerMuted     Boolean @default(false)
  sellerMuted    Boolean @default(false)
  phoneRevealedAt DateTime?
  createdAt    DateTime @default(now())
  listing      Listing  @relation(fields: [listingId], references: [id])
  messages     Message[]
  offers       Offer[]
  @@unique([listingId, buyerId])
  @@index([sellerId, lastMessageAt])
  @@index([buyerId, lastMessageAt])
}

model Message {
  id              String   @id @db.Uuid
  conversationId  String   @db.Uuid
  senderId        String   @db.Uuid
  kind            String   @default("TEXT") // TEXT | IMAGE | OFFER | SYSTEM | QUICK_REPLY
  body            String?  @db.VarChar(2000) // stored with masking applied
  maskedContactCount Int   @default(0)
  imageKeys       String[]
  offerId         String?  @db.Uuid
  createdAt       DateTime @default(now())
  readAt          DateTime?
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  @@index([conversationId, createdAt])
}

model Offer {
  id              String      @id @db.Uuid
  listingId       String      @db.Uuid
  conversationId  String      @db.Uuid
  buyerId         String      @db.Uuid
  sellerId        String      @db.Uuid
  amount          Int         // minor units
  currency        String      @default("EUR")
  status          OfferStatus @default(OPEN)
  parentOfferId   String?     @db.Uuid   // counter-offer chain
  expiresAt       DateTime
  decidedAt       DateTime?
  acceptedPriceValidUntil DateTime?
  createdAt       DateTime    @default(now())
  listing         Listing     @relation(fields: [listingId], references: [id])
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  @@index([listingId, status])
}
```

## 9. Auctions (R3)

```prisma
model AuctionRule {
  id              String   @id @db.Uuid
  version         Int      @unique
  title           String
  body_lv         String
  body_ru         String
  body_en         String
  effectiveFrom   DateTime
  createdAt       DateTime @default(now())
}

model AuctionAcceptance {
  auctionId     String   @db.Uuid
  userId        String   @db.Uuid
  ruleVersion   Int
  acceptedAt    DateTime @default(now())
  @@id([auctionId, userId])
}

model Auction {
  id                String        @id @db.Uuid
  listingId         String        @unique @db.Uuid
  sellerId          String        @db.Uuid
  status            AuctionStatus @default(SCHEDULED)
  startingPrice     Int           // minor units
  reservePrice      Int?          // hidden
  buyNowPrice       Int?
  currentPrice     Int           @default(0)  // visible price, updated atomically with bids
  leadingBidId      String?       @db.Uuid
  bidCount         Int           @default(0)
  incrementLadderId String
  buyersPremiumRate Decimal?      @db.Decimal(5, 4)
  buyersPremiumFixed Int?
  startsAt         DateTime
  endsAt           DateTime      // current end, changes with extensions
  originalEndsAt   DateTime
  extensionCount   Int           @default(0)
  antiSnipeWindowSeconds Int     @default(120)
  antiSnipeExtensionSeconds Int  @default(120)
  maxExtensions    Int           @default(10)
  ruleVersion      Int
  authenticationRequired Boolean @default(false)
  closedAt         DateTime?
  outcomeRecordedAt DateTime?
  version          Int           @default(0)   // optimistic concurrency helper
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  listing          Listing       @relation(fields: [listingId], references: [id])
  bids             Bid[]
  @@index([status, endsAt])
}

model Bid {
  id             String    @id @db.Uuid
  auctionId      String    @db.Uuid
  bidderId       String    @db.Uuid
  maxAmount      Int       // proxy maximum, never revealed
  visibleAmount  Int       // amount at which this bid led, if it led
  status         BidStatus @default(ACCEPTED)
  idempotencyKey String    @db.Uuid
  sequence       BigInt    // monotonic per auction, assigned in the bid transaction
  createdAt      DateTime  @default(now())
  retractedAt    DateTime?
  auction        Auction   @relation(fields: [auctionId], references: [id])
  @@unique([auctionId, idempotencyKey])
  @@unique([auctionId, sequence])
  @@index([bidderId, createdAt])
}

model BidderMaxSummary {
  auctionId String @db.Uuid
  bidderId  String @db.Uuid
  maxAmount Int
  sequence  BigInt
  @@id([auctionId, bidderId])
  @@index([auctionId, maxAmount, sequence])
}

model LinkedAccountFlag {
  userIdA    String   @db.Uuid
  userIdB    String   @db.Uuid
  reason     String   // DEVICE | PAYMENT | IP_CLUSTER | MANUAL
  createdAt  DateTime @default(now())
  @@id([userIdA, userIdB, reason])
}
```

## 10. Orders, payments, escrow, and ledger (R2)

```prisma
model Order {
  id                 String      @id @db.Uuid
  listingId          String      @db.Uuid
  auctionId          String?     @db.Uuid
  offerId            String?     @db.Uuid
  buyerId            String      @db.Uuid
  sellerId           String      @db.Uuid
  status             OrderStatus @default(AWAITING_PAYMENT)
  itemAmount         Int         // minor units
  buyerFeeAmount     Int         @default(0)
  sellerFeeAmount    Int         @default(0)
  buyersPremiumAmount Int        @default(0)
  shippingAmount     Int         @default(0)
  vatAmount          Int         @default(0)
  totalAmount        Int         // charged to buyer
  currency           String      @default("EUR")
  deliveryMethod     String      // PICKUP | PARCEL | FREIGHT
  pickupPointId      String?
  shipDeadlineAt     DateTime?
  paymentDeadlineAt  DateTime?
  autoReleaseAt      DateTime?
  paidAt             DateTime?
  deliveredAt        DateTime?
  confirmedAt        DateTime?
  releasedAt         DateTime?
  cancelledAt        DateTime?
  cancelReason       String?
  feeSnapshot        Json        // fee rules applied at order time
  version            Int         @default(0)
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt
  listing            Listing     @relation(fields: [listingId], references: [id])
  payments           Payment[]
  shipments          Shipment[]
  disputes           Dispute[]
  reviews            Review[]
  ledgerTransactions LedgerTransaction[]
  invoices           Invoice[]
  @@index([buyerId, status])
  @@index([sellerId, status])
  @@index([status, paymentDeadlineAt])
  @@index([status, autoReleaseAt])
  @@unique([listingId, offerId])
}

model Payment {
  id              String        @id @db.Uuid
  orderId         String        @db.Uuid
  providerPaymentId String      @unique
  provider        String        // STRIPE | BALTIC_PSP (per DEC-05)
  status          PaymentStatus @default(PENDING)
  amount          Int
  currency        String        @default("EUR")
  method          String        // CARD | BANK | APPLE_PAY | GOOGLE_PAY
  idempotencyKey  String        @db.Uuid
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  order           Order         @relation(fields: [orderId], references: [id])
  refunds         Refund[]
  @@index([orderId])
}

model Refund {
  id                String   @id @db.Uuid
  paymentId         String   @db.Uuid
  disputeId         String?  @db.Uuid
  providerRefundId  String?  @unique
  amount            Int
  reason            String
  status            String   @default("PENDING") // PENDING | SUCCEEDED | FAILED
  createdAt         DateTime @default(now())
  payment           Payment  @relation(fields: [paymentId], references: [id])
}

model Dispute {
  id              String        @id @db.Uuid
  orderId         String        @db.Uuid
  openedById      String        @db.Uuid
  reason          String        // NOT_AS_DESCRIBED | DAMAGED | MISSING | NOT_DELIVERED | OTHER
  status          DisputeStatus @default(OPEN)
  outcome         String?       // FULL_REFUND | PARTIAL_REFUND | RETURN | REPLACEMENT | RELEASED | NONE
  refundAmount    Int?
  responseDueAt   DateTime
  reviewDueAt     DateTime?
  decidedById     String?       @db.Uuid
  decidedAt       DateTime?
  appealCount     Int           @default(0)
  createdAt       DateTime      @default(now())
  order           Order         @relation(fields: [orderId], references: [id])
  evidence        DisputeEvidence[]
  @@index([status, responseDueAt])
}

model DisputeEvidence {
  id         String   @id @db.Uuid
  disputeId  String   @db.Uuid
  uploaderId String   @db.Uuid
  kind       String   // PHOTO | VIDEO | MESSAGE_EXPORT | DOCUMENT | NOTE
  storageKey String?
  note       String?  @db.VarChar(1000)
  createdAt  DateTime @default(now())
  dispute    Dispute  @relation(fields: [disputeId], references: [id])
}

model LedgerAccount {
  id          String  @id @db.Uuid
  code        String  @unique   // see 05-payments-escrow.md
  name        String
  type        String  // ASSET | LIABILITY | REVENUE | EXPENSE | CONTRA
  ownerUserId String? @db.Uuid
  currency    String  @default("EUR")
  entries     LedgerEntry[]
}

model LedgerTransaction {
  id          String   @id @db.Uuid
  orderId     String?  @db.Uuid
  kind        String   // SALE_CAPTURED | ESCROW_RELEASE | REFUND | PAYOUT | FEE | VAT | ADJUSTMENT | CHARGEBACK
  description String
  postedAt    DateTime @default(now())
  createdBy   String   // SYSTEM or staff user id
  idempotencyKey String @unique
  entries     LedgerEntry[]
  order       Order?   @relation(fields: [orderId], references: [id])
}

model LedgerEntry {
  id                  String   @id @db.Uuid
  transactionId      String   @db.Uuid
  accountId           String   @db.Uuid
  direction           String   // DEBIT | CREDIT
  amount              BigInt   // positive minor units
  currency            String   @default("EUR")
  transaction         LedgerTransaction @relation(fields: [transactionId], references: [id])
  account             LedgerAccount     @relation(fields: [accountId], references: [id])
  @@index([accountId])
  @@index([transactionId])
}

model PayoutAccount {
  id                 String   @id @db.Uuid
  userId             String?  @db.Uuid
  companyId          String?  @db.Uuid
  ibanMasked         String   // for example LV** **** **** **** 1234
  ibanEncryptedRef   String   // reference to encrypted value in the secure store
  holderName         String
  verifiedAt         DateTime?
  createdAt          DateTime @default(now())
}

model Payout {
  id              String       @id @db.Uuid
  sellerUserId    String?      @db.Uuid
  sellerCompanyId String?      @db.Uuid
  amount          Int
  currency        String       @default("EUR")
  status          PayoutStatus @default(SCHEDULED)
  scheduledFor    DateTime
  paidAt          DateTime?
  providerPayoutId String?     @unique
  approvedById    String?      @db.Uuid
  approvedAt      DateTime?
  holdReason      String?
  createdAt       DateTime     @default(now())
}

model FeeRule {
  id              String   @id @db.Uuid
  appliesTo       String   // CATEGORY | PRICE_TYPE | GLOBAL | SELLER_TIER
  scope           String   // category code or key
  feeType         FeeType
  rate            Decimal? @db.Decimal(6, 4)
  fixedAmount     Int?
  minAmount       Int?
  maxAmount       Int?
  payer           String   // BUYER | SELLER | SPLIT
  vatTreatment    VatTreatment @default(STANDARD)
  effectiveFrom   DateTime
  effectiveTo     DateTime?
  createdById     String   @db.Uuid
  createdAt       DateTime @default(now())
}

model Invoice {
  id            String   @id @db.Uuid
  number        String   @unique   // sequential per series
  series        String
  orderId       String?  @db.Uuid
  issuerRef     String   // PLATFORM | COMPANY:<id> | SELLER:<id>
  recipientRef  String
  kind          String   // FEE | RECEIPT | B2B_INVOICE | CREDIT_NOTE
  netAmount     Int
  vatAmount     Int
  grossAmount   Int
  vatRate       Decimal  @db.Decimal(5, 4)
  issuedAt      DateTime @default(now())
  pdfKey        String?
  creditsInvoiceId String? @db.Uuid
  order         Order?   @relation(fields: [orderId], references: [id])
  @@index([orderId])
}
```

## 11. Shipping (R2)

```prisma
model ShippingProfile {
  id            String   @id @db.Uuid
  ownerUserId   String?  @db.Uuid
  companyId     String?  @db.Uuid
  name          String
  carriers      CarrierCode[]
  maxWeightGrams Int?
  maxLengthCm   Int?
  flatPrices    Json      // per carrier and size band
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
}

model Shipment {
  id              String         @id @db.Uuid
  orderId         String         @db.Uuid
  carrier         CarrierCode
  trackingNumber  String?        @unique
  labelKey        String?
  status          ShipmentStatus @default(LABEL_CREATED)
  pickupPointId   String?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  createdAt       DateTime       @default(now())
  order           Order          @relation(fields: [orderId], references: [id])
  events          ShipmentEvent[]
}

model ShipmentEvent {
  id          String   @id @db.Uuid
  shipmentId  String   @db.Uuid
  code        String   // carrier event code, mapped
  status      ShipmentStatus
  occurredAt  DateTime
  rawEventId  String   @unique   // for idempotency with carrier events
  createdAt   DateTime @default(now())
  shipment    Shipment @relation(fields: [shipmentId], references: [id])
  @@index([shipmentId, occurredAt])
}
```

## 12. Reviews

```prisma
model Review {
  id           String   @id @db.Uuid
  orderId      String   @db.Uuid
  authorId     String   @db.Uuid
  targetId     String   @db.Uuid
  role         String   // BUYER_TO_SELLER | SELLER_TO_BUYER
  rating       Int      // 1 to 5
  text         String?  @db.VarChar(500)
  reply        String?  @db.VarChar(500)
  replyAt      DateTime?
  publishedAt  DateTime?
  removedAt    DateTime?
  removalReason String?
  createdAt    DateTime @default(now())
  order        Order    @relation(fields: [orderId], references: [id])
  @@unique([orderId, role])
  @@index([targetId, publishedAt])
}
```

## 13. Trust, safety, and moderation

```prisma
model Report {
  id              String       @id @db.Uuid
  reporterId      String?      @db.Uuid
  targetType      String       // LISTING | USER | MESSAGE | REVIEW | AUCTION
  targetId        String       @db.Uuid
  reasonCode      String
  description     String?      @db.VarChar(500)
  severity        Severity     @default(MEDIUM)
  status          ReportStatus @default(OPEN)
  caseId          String?      @db.Uuid
  createdAt       DateTime     @default(now())
  listing         Listing?     @relation(fields: [targetId], references: [id], map: "report_listing_fk")
  @@index([status, severity, createdAt])
  @@index([targetType, targetId])
}

model ModerationCase {
  id            String           @id @db.Uuid
  subjectType   String           // LISTING | USER | COMPANY | AUCTION | MESSAGE
  subjectId     String           @db.Uuid
  source        String           // REPORT | RULE | MANUAL | FRAUD | LEGAL | APPEAL
  severity      Severity
  status        ModerationStatus @default(QUEUED)
  assignedToId  String?          @db.Uuid
  assignedLevel String           // M1 | M2
  slaDueAt      DateTime
  decidedAt     DateTime?
  outcome       String?
  createdAt     DateTime         @default(now())
  actions       ModerationAction[]
  @@index([status, severity, slaDueAt])
}

model ModerationAction {
  id          String   @id @db.Uuid
  caseId      String   @db.Uuid
  actorId     String   @db.Uuid
  actionCode  String   // APPROVE | EDIT_REQUIRED | REMOVE | RESTRICT | SUSPEND | ESCALATE | ...
  reasonCode  String
  note        String?  @db.VarChar(1000)
  createdAt   DateTime @default(now())
  case        ModerationCase @relation(fields: [caseId], references: [id])
}

model Enforcement {
  id          String          @id @db.Uuid
  userId      String          @db.Uuid
  type        EnforcementType
  reasonCode  String
  startsAt    DateTime        @default(now())
  endsAt      DateTime?
  caseId      String?         @db.Uuid
  reversedAt  DateTime?
  reversedById String?        @db.Uuid
  @@index([userId, startsAt])
}

model Appeal {
  id            String   @id @db.Uuid
  subjectType   String   // LISTING | USER | ORDER | ENFORCEMENT
  subjectId     String   @db.Uuid
  userId        String   @db.Uuid
  note          String?  @db.VarChar(1000)
  status        String   @default("OPEN") // OPEN | UPHELD | REVERSED | CHANGED
  originalDecisionBy String @db.Uuid
  decidedById   String?  @db.Uuid
  decidedAt     DateTime?
  createdAt     DateTime @default(now())
  @@index([status, createdAt])
}

model FraudSignal {
  id          String   @id @db.Uuid
  userId      String?  @db.Uuid
  subjectType String
  subjectId   String   @db.Uuid
  signal      String   // NEW_ACCOUNT_VELOCITY | DEVICE_SHARED | PAYMENT_MISMATCH | SCAM_PHRASE | ...
  weight      Int
  createdAt   DateTime @default(now())
  @@index([userId, createdAt])
}

model FraudScore {
  userId      String   @id @db.Uuid
  score       Int      // 0 to 100
  computedAt  DateTime @default(now())
  modelVersion String
}

model LegalRequest {
  id              String   @id @db.Uuid
  kind            String   // LAW_ENFORCEMENT | COURT | OTHER
  authority       String
  referenceNumber String
  receivedAt      DateTime
  responseDueAt   DateTime?
  status          String   @default("OPEN")
  scope           String   // users and data requested
  disclosedAt     DateTime?
  handledById     String   @db.Uuid
  createdAt       DateTime @default(now())
}

model DsaNotice {
  id              String   @id @db.Uuid
  targetType      String
  targetId        String   @db.Uuid
  notifierName    String?
  notifierEmail   String?  // PII
  explanation     String   @db.VarChar(2000)
  status          String   @default("OPEN") // OPEN | ACTIONED | DISMISSED
  decisionCode   String?
  statementSentAt DateTime?
  createdAt       DateTime @default(now())
}
```

## 14. Promotions (R2)

```prisma
model PromotionPackage {
  id          String        @id @db.Uuid
  code        String        @unique
  type        PromotionType
  durationHours Int
  priceAmount Int
  currency    String        @default("EUR")
  active      Boolean       @default(true)
  promotions  Promotion[]
}

model Promotion {
  id              String   @id @db.Uuid
  listingId       String   @db.Uuid
  packageId       String   @db.Uuid
  buyerId         String   @db.Uuid
  budgetAmount    Int?
  targetCategory  String?
  targetRegion    String?
  startsAt        DateTime?
  endsAt          DateTime?
  status          String   @default("PENDING") // PENDING | ACTIVE | ENDED | CANCELLED
  paymentId       String?  @db.Uuid
  createdAt       DateTime @default(now())
  listing         Listing  @relation(fields: [listingId], references: [id])
  package         PromotionPackage @relation(fields: [packageId], references: [id])
  @@index([status, endsAt])
}
```

## 15. Business (R4)

```prisma
model Rfq {
  id            String   @id @db.Uuid
  buyerCompanyId String  @db.Uuid
  categoryCode  String
  specification Json
  quantity      Int
  deliveryCity  String
  deliveryDate  DateTime?
  deadlineAt    DateTime
  status        String   @default("OPEN") // OPEN | CLOSED | AWARDED | CANCELLED
  createdAt     DateTime @default(now())
  responses     RfqResponse[]
}

model RfqResponse {
  id            String   @id @db.Uuid
  rfqId         String   @db.Uuid
  sellerCompanyId String @db.Uuid
  unitPrice     Int
  totalPrice    Int
  currency      String   @default("EUR")
  availability  String
  terms         String?  @db.VarChar(2000)
  status        String   @default("SUBMITTED") // SUBMITTED | ACCEPTED | DECLINED | WITHDRAWN
  createdAt     DateTime @default(now())
  rfq           Rfq      @relation(fields: [rfqId], references: [id])
  @@unique([rfqId, sellerCompanyId])
}

model Tender {
  id            String   @id @db.Uuid
  listingId     String   @unique @db.Uuid
  sellerCompanyId String @db.Uuid
  minimumPrice  Int?    // hidden
  deadlineAt    DateTime
  awardRules    String  @db.VarChar(2000)
  status        String  @default("OPEN") // OPEN | CLOSED | AWARDED | NOT_AWARDED
  createdAt     DateTime @default(now())
  bids          TenderBid[]
}

model TenderBid {
  id           String   @id @db.Uuid
  tenderId     String   @db.Uuid
  bidderCompanyId String @db.Uuid
  amount       Int
  currency     String   @default("EUR")
  submittedAt  DateTime @default(now())
  status       String   @default("SEALED") // SEALED | OPENED | WON | LOST | WITHDRAWN
  tender       Tender   @relation(fields: [tenderId], references: [id])
  @@unique([tenderId, bidderCompanyId])
}
```

## 16. Operations

```prisma
model AuditEvent {
  id          String   @id @db.Uuid
  occurredAt  DateTime @default(now())
  actorType   String   // USER | STAFF | SYSTEM | API_KEY | WEBHOOK
  actorId     String?
  action      String   // for example bid.accepted, order.released, moderation.removed
  entityType  String
  entityId    String
  reason      String?
  before      Json?
  after       Json?
  requestId   String?
  ipPrefix    String?
  @@index([entityType, entityId, occurredAt])
  @@index([actorId, occurredAt])
  @@index([action, occurredAt])
}
// Append-only: database role has INSERT and SELECT only.

model OutboxEvent {
  id          String   @id @db.Uuid
  topic       String   // listing.published | auction.bid_accepted | order.paid | ...
  payload     Json     // identifiers and state, no personal data
  createdAt   DateTime @default(now())
  publishedAt DateTime?
  attempts    Int      @default(0)
  @@index([publishedAt, createdAt])
}

model IdempotencyKey {
  key         String   @id @db.Uuid
  userId      String   @db.Uuid
  route       String
  requestHash String
  status      Int
  response    Json?
  createdAt   DateTime @default(now())
  expiresAt   DateTime
  @@index([expiresAt])
}

model FeatureFlag {
  key         String   @id
  description String
  enabled     Boolean  @default(false)
  rollout     Int      @default(0)     // percentage
  roles       String[]
  updatedById String   @db.Uuid
  updatedAt   DateTime @updatedAt
}

model PlatformSetting {
  key         String   @id
  valueJson   Json
  effectiveFrom DateTime @default(now())
  changedById String   @db.Uuid
  reason      String
}

model Notification {
  id          String              @id @db.Uuid
  userId      String              @db.Uuid
  type        String              // matches notification catalogue in 09-testing-release-ops.md
  channel     NotificationChannel
  payload     Json                // identifiers and short text, no personal data beyond what the channel needs
  status      String              @default("QUEUED") // QUEUED | SENT | FAILED | SUPPRESSED
  createdAt   DateTime            @default(now())
  sentAt      DateTime?
  readAt      DateTime?
  @@index([userId, createdAt])
  @@index([status, createdAt])
}

model NotificationPreference {
  userId      String  @id @db.Uuid
  channels    Json    // per category and channel
  quietFrom   String  @default("22:00")
  quietTo     String  @default("08:00")
  timezone    String  @default("Europe/Riga")
  user        User    @relation(fields: [userId], references: [id])
}

model PushSubscription {
  id          String   @id @db.Uuid
  userId      String   @db.Uuid
  endpointHash String  @unique
  keysRef     String   // reference to encrypted keys
  createdAt   DateTime @default(now())
  revokedAt   DateTime?
}

model SupportTicket {
  id            String   @id @db.Uuid
  userId        String?  @db.Uuid
  email         String?  // PII
  subject       String
  category      String
  status        String   @default("OPEN")
  priority      String   @default("NORMAL")
  linkedListingId String? @db.Uuid
  linkedOrderId   String? @db.Uuid
  assignedToId  String?  @db.Uuid
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([status, priority, createdAt])
}

model DataExportJob {
  id          String   @id @db.Uuid
  userId      String   @db.Uuid
  status      String   @default("QUEUED")
  storageKey  String?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  completedAt DateTime?
}

model DeletionRequest {
  id          String   @id @db.Uuid
  userId      String   @db.Uuid
  requestedAt DateTime @default(now())
  executeAt   DateTime
  cancelledAt DateTime?
  completedAt DateTime?
  @@index([executeAt])
}

model ContentPage {
  id        String   @id @db.Uuid
  slug      String
  locale    String   // lv | ru | en
  title     String
  body      String   @db.Text
  version   Int      @default(1)
  status    String   @default("DRAFT") // DRAFT | PUBLISHED | RETIRED
  publishedAt DateTime?
  @@unique([slug, locale, version])
}

model JobRun {
  id          String   @id @db.Uuid
  jobName     String
  jobKey      String
  startedAt   DateTime @default(now())
  finishedAt  DateTime?
  status      String   // RUNNING | SUCCEEDED | FAILED | SKIPPED
  error       String?
  @@index([jobName, jobKey])
}
```

## 17. Integrity rules (enforced in code, checked by reconciliation)

1. Every ledger transaction has entries whose debits equal credits per currency. Violations fail the transaction and raise an alert.
2. `Auction.currentPrice` never decreases, and `Bid.sequence` is strictly increasing per auction.
3. `Order.totalAmount` equals the sum of components (`itemAmount`, `buyerFeeAmount`, `buyersPremiumAmount`, `shippingAmount`, `vatAmount`) as defined in `03-business-rules.md`.
4. A listing has at most one open auction or one accepted offer that moves it to `RESERVED`.
5. `User.activeListings` is recomputed nightly from `Listing` and corrected if it drifts.
6. `Identity.subjectHash` is unique per provider. The raw personal code is never stored.
7. `Session.tokenHash` is unique; raw tokens are never stored.
8. `AuditEvent` rows are never updated or deleted by application roles.

## 18. Index and performance notes

- Partial index on `Listing (categoryCode, publishedAt DESC)` where `status = 'ACTIVE'` for browse.
- GIN index on `Listing.searchVector`.
- GIST index on `Category.path` for subtree queries.
- B-tree on `ListingAttributeValue (attributeId, valueOption)` and `(attributeId, valueNumber)` for facet filters.
- `Bid (auctionId, sequence)` covers the outbid lookup.
- Partition `AuditEvent` by month once it exceeds 50 million rows.
- Partition `LedgerEntry` by year after two years of operation, if needed.
