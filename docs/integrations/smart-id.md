# Integration Specification: Smart-ID Authentication

Smart-ID provides a secure, eIDAS-compliant authentication method for Latvian users.

## Flow
1. User clicks "Login with Smart-ID" on SellBuy.lv.
2. Frontend sends the user's personal code (PK) to backend.
3. Backend initiates authentication request to Smart-ID API.
4. User confirms login on their Smart-ID app (PIN1).
5. Smart-ID returns a signed token/certificate.
6. Backend verifies the signature and creates/updates the `User` record.
6. JWT session cookie is issued to the user.

## Requirements
- Valid Smart-ID Agreement (Service Provider).
- Certificate validation (OCSP/CRL checks).
- Store user's personal code and certificate serial number in `User` model (to be added).

## Implementation Note
- Must be implemented as a Next.js API Route (`app/api/auth/smart-id/...`).
- Requires `node-forge` or similar for signature verification.