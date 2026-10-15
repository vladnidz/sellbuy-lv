/**
 * Chat Filter & Safe Reveal Utility
 *
 * Implements US-05.03: Contact Details Masking & Safe Reveal.
 * Protects buyers and sellers from off-platform fraud by detecting and masking
 * raw phone numbers, email addresses, and external contact links until mutual interest
 * is established (both parties sent messages in chat) or at least one participant
 * holds verified L2 status (Smart-ID or eParaksts).
 */

export type ContactDetectionType = 'phone' | 'email' | 'link';

export interface ContactDetection {
  type: ContactDetectionType;
  match: string;
  index: number;
}

export interface MaskResult {
  maskedText: string;
  hasSensitiveData: boolean;
  detectedTypes: ContactDetectionType[];
  detections: ContactDetection[];
}

export interface ChatParticipant {
  id?: string;
  isVerified?: boolean;
  verifiedTypes?: string[];
}

export interface CanRevealParams {
  messages?: Array<{ senderId: string }>;
  buyerId?: string;
  sellerId?: string;
  buyer?: ChatParticipant | null;
  seller?: ChatParticipant | null;
}

export interface CanRevealResult {
  canReveal: boolean;
  reason: 'mutual_interest' | 'l2_verified' | 'not_eligible';
  mutualInterest: boolean;
  isL2Verified: boolean;
}

export const PHONE_MASK_LABEL = '[Tālrunis slēpts drošībai]';
export const EMAIL_MASK_LABEL = '[E-pasts slēpts drošībai]';
export const LINK_MASK_LABEL = '[Saite slēpta drošībai]';

/**
 * Checks whether a user holds Level 2 identity verification (Smart-ID or eParaksts).
 */
export function isL2Verified(user?: ChatParticipant | null): boolean {
  if (!user) return false;
  const types = user.verifiedTypes || [];
  return types.includes('smart_id') || types.includes('eparaksts');
}

/**
 * Checks whether both the buyer and seller have engaged in the conversation.
 * Mutual interest is satisfied once at least one message from the buyer and
 * one message from the seller exist.
 */
export function hasMutualInterest(
  messages: Array<{ senderId: string }> = [],
  buyerId?: string,
  sellerId?: string
): boolean {
  if (!buyerId || !sellerId || messages.length < 2) {
    return false;
  }
  const senders = new Set(messages.map((m) => m.senderId));
  return senders.has(buyerId) && senders.has(sellerId);
}

/**
 * Determines whether raw contact details may be revealed in the chat.
 * Allowed if:
 * 1. Mutual interest exists (both parties messaged), OR
 * 2. Either buyer or seller has verified L2 status (Smart-ID / eParaksts).
 */
export function canRevealContactDetails(params: CanRevealParams): CanRevealResult {
  const { messages = [], buyerId, sellerId, buyer, seller } = params;

  const mutual = hasMutualInterest(messages, buyerId, sellerId);
  const l2 = isL2Verified(buyer) || isL2Verified(seller);

  if (l2) {
    return {
      canReveal: true,
      reason: 'l2_verified',
      mutualInterest: mutual,
      isL2Verified: true,
    };
  }

  if (mutual) {
    return {
      canReveal: true,
      reason: 'mutual_interest',
      mutualInterest: true,
      isL2Verified: false,
    };
  }

  return {
    canReveal: false,
    reason: 'not_eligible',
    mutualInterest: false,
    isL2Verified: false,
  };
}

/**
 * Detects contact details (emails, phone numbers, external messaging links) in a text string.
 */
export function detectContactDetails(text: string): {
  hasContactDetails: boolean;
  types: ContactDetectionType[];
  detections: ContactDetection[];
} {
  if (!text || typeof text !== 'string') {
    return { hasContactDetails: false, types: [], detections: [] };
  }

  const detections: ContactDetection[] = [];

  // 1. Email detection (standard and bracketed obfuscations like name[at]domain[dot]com)
  const emailRegex =
    /\b([a-zA-Z0-9._%+-]+(?:\s*(?:@|\[at\]|\(at\))\s*)[a-zA-Z0-9.-]+(?:\s*(?:\.|\[dot\]|\(dot\))\s*)[a-zA-Z]{2,})\b/gi;
  let emailMatch: RegExpExecArray | null;
  while ((emailMatch = emailRegex.exec(text)) !== null) {
    detections.push({
      type: 'email',
      match: emailMatch[0],
      index: emailMatch.index,
    });
  }

  // 2. Off-platform messaging URLs / handles (Telegram, WhatsApp, Viber, etc.)
  const linkRegex =
    /(?:https?:\/\/)?(?:t\.me|telegram\.me|wa\.me|chat\.whatsapp\.com|viber\.me)\/[a-zA-Z0-9_+.-]+|(?:telegram|tg|whatsapp|wa|viber)\s*[:@]\s*([a-zA-Z0-9_.-]+)/gi;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkRegex.exec(text)) !== null) {
    detections.push({
      type: 'link',
      match: linkMatch[0],
      index: linkMatch.index,
    });
  }

  // 3. Phone numbers
  // Matches:
  // - LV format with prefix: +371 2XXXXXXX, +371 6XXXXXXX (with optional dashes/spaces)
  // - LV format local 8 digits starting with 2 or 6: 2XXXXXXX, 6XXXXXXX, 29 123 456, 29-12-34-56
  // - Spaced out digits: 2 9 1 2 3 4 5 6
  // - International phones with country code: +[1-9]\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}
  // - Numbers preceded by phone keywords: tālr., tel., mob., phone, whatsapp, numurs, zvaniet uz
  const phonePatterns = [
    // Latvian +371 prefix
    /(?:\+371|00371)[\s.-]?[26](?:[\s.-]?\d){7}\b/g,
    // Latvian local 8-digit phone numbers starting with 2 or 6
    /(?<![0-9/])(?:\+?371[\s.-]?)?[26]\d{2}[\s.-]?\d{2}[\s.-]?\d{3}\b/g,
    /(?<![0-9/])[26]\d{3}[\s.-]?\d{4}\b/g,
    // Spaced out 8 digits starting with 2 or 6: e.g. 2 9 1 2 3 4 5 6
    /(?<![0-9/])[26](?:\s+\d){7}\b/g,
    // International numbers starting with + and 8 to 15 digits
    /(?<![0-9/])\+(?:[1-9]\d{0,2})[\s.-]?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,6}\b/g,
    // Explicit phone label followed by 7-15 digits: e.g. "tel: 29123456" or "zvaniet: 29123456"
    /(?:(?:tālr(?:unis)?|tel(?:eph)?|mob(?:ilais)?|phone|whatsapp|zvaniet(?: uz)?|rakstiet(?: uz)?|numurs)\s*[:.-]?\s*)([0-9\s+()-]{7,16})/gi,
  ];

  for (const pattern of phonePatterns) {
    let pMatch: RegExpExecArray | null;
    while ((pMatch = pattern.exec(text)) !== null) {
      const matchStr = pMatch[0];
      // Exclude matches that are purely standard years (e.g. 2024) or prices (e.g. 2500 EUR)
      const digitsOnly = matchStr.replace(/\D/g, '');
      if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
        // Avoid duplicate overlaps
        const alreadyDetected = detections.some(
          (d) =>
            (pMatch!.index >= d.index && pMatch!.index < d.index + d.match.length) ||
            (d.index >= pMatch!.index && d.index < pMatch!.index + matchStr.length)
        );
        if (!alreadyDetected) {
          detections.push({
            type: 'phone',
            match: matchStr,
            index: pMatch.index,
          });
        }
      }
    }
  }

  // Sort by index in text
  detections.sort((a, b) => a.index - b.index);

  const uniqueTypes = Array.from(new Set(detections.map((d) => d.type)));

  return {
    hasContactDetails: detections.length > 0,
    types: uniqueTypes,
    detections,
  };
}

/**
 * Masks any detected contact details with a user-friendly security label.
 */
export function maskContactDetails(text: string): MaskResult {
  if (!text || typeof text !== 'string') {
    return {
      maskedText: '',
      hasSensitiveData: false,
      detectedTypes: [],
      detections: [],
    };
  }

  const { detections, types, hasContactDetails } = detectContactDetails(text);

  if (!hasContactDetails) {
    return {
      maskedText: text,
      hasSensitiveData: false,
      detectedTypes: [],
      detections: [],
    };
  }

  let masked = text;
  // Replace in reverse order so string indices remain valid
  const reversed = [...detections].sort((a, b) => b.index - a.index);

  for (const item of reversed) {
    let maskLabel = PHONE_MASK_LABEL;
    if (item.type === 'email') maskLabel = EMAIL_MASK_LABEL;
    if (item.type === 'link') maskLabel = LINK_MASK_LABEL;

    const before = masked.slice(0, item.index);
    const after = masked.slice(item.index + item.match.length);
    masked = `${before}${maskLabel}${after}`;
  }

  return {
    maskedText: masked,
    hasSensitiveData: true,
    detectedTypes: types,
    detections,
  };
}

/**
 * Prepares message content for a given viewer and chat context.
 * If canReveal is false and sensitive contact details exist:
 * - Content returned is masked
 * - Original content is preserved if requested or if viewer is the author
 */
export function sanitizeMessageForDisplay(
  content: string,
  canReveal: boolean,
  options?: { isOwn?: boolean }
): {
  content: string;
  isMasked: boolean;
  hasContactInfo: boolean;
  originalContent?: string;
  detectedTypes: ContactDetectionType[];
} {
  const maskInfo = maskContactDetails(content);

  if (!maskInfo.hasSensitiveData) {
    return {
      content,
      isMasked: false,
      hasContactInfo: false,
      detectedTypes: [],
    };
  }

  // If chat is eligible for reveal, return the unmasked content
  if (canReveal) {
    return {
      content,
      isMasked: false,
      hasContactInfo: true,
      originalContent: content,
      detectedTypes: maskInfo.detectedTypes,
    };
  }

  // Not eligible: if author is looking at their own message, they can see original
  // but it's marked as masked for recipients
  if (options?.isOwn) {
    return {
      content,
      isMasked: true,
      hasContactInfo: true,
      originalContent: content,
      detectedTypes: maskInfo.detectedTypes,
    };
  }

  // Recipient sees masked text
  return {
    content: maskInfo.maskedText,
    isMasked: true,
    hasContactInfo: true,
    originalContent: content,
    detectedTypes: maskInfo.detectedTypes,
  };
}
