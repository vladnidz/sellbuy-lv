# Functional Specification: Chat

The chat system enables real-time communication between buyers and sellers.

## Data Model
- `Chat`: Manages the session between two `User`s.
- `Message`: Stores the text content and links to the parent `Chat` and sender `User`.

## Key Features
- **Participants:** Only two participants per chat.
- **Persistence:** All messages are stored permanently in the PostgreSQL database.
- **Integration:** Chat is linked to specific `Listing`s to maintain context.
