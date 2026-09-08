-- AlterTable: Add password field to User
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';

-- AlterTable: Add messages relation to User (no actual column needed for implicit many-to-many)

-- CreateTable: Update Chat with buyer/seller/listing relations
-- First, drop the old implicit many-to-many table if it exists
DROP TABLE IF EXISTS "_ChatToUser" CASCADE;

-- Recreate Chat with explicit relations
ALTER TABLE "Chat" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Chat" ADD COLUMN "listingId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Chat" ADD COLUMN "buyerId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Chat" ADD COLUMN "sellerId" TEXT NOT NULL DEFAULT '';

-- Add foreign keys for Chat
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Add createdAt and sender relation to Message
ALTER TABLE "Message" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add sender relation to Message (senderId already exists as a column)
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
