import {
  detectContacts,
  maskContacts,
  canRevealContacts,
  auditRevealEvent,
} from '@/app/lib/chat-filter';

describe('chat-filter (US-05.03)', () => {
  describe('detectContacts', () => {
    it('detects standard Latvian phone numbers (+371 and local 8-digit)', () => {
      expect(detectContacts('Zvaniet man uz +371 29123456 rīt').phones).toHaveLength(1);
      expect(detectContacts('Mans numurs ir 29123456').phones).toHaveLength(1);
      expect(detectContacts('Numurs: +37129123456 vai 67123456').phones).toHaveLength(2);
    });

    it('detects spaced, hyphenated and obfuscated phone numbers', () => {
      expect(detectContacts('Tālr: 29 123 456').phones).toHaveLength(1);
      expect(detectContacts('Tālr: 29-123-456').phones).toHaveLength(1);
      expect(detectContacts('Zvani 2 9 1 2 3 4 5 6').phones).toHaveLength(1);
      expect(detectContacts('+371 (29) 123-456').phones).toHaveLength(1);
    });

    it('detects standard and obfuscated email addresses', () => {
      expect(detectContacts('Rakstiet uz janis@example.lv paldies').emails).toContain('janis@example.lv');
      expect(detectContacts('E-pasts: test.user+tag@domain.co.uk').emails).toContain('test.user+tag@domain.co.uk');
      expect(detectContacts('Raksti: janis [at] domain [dot] com').emails).toHaveLength(1);
      expect(detectContacts('Kontakts: anna(at)gmail.com').emails).toHaveLength(1);
    });

    it('does not flag normal text, numbers, or prices', () => {
      const res = detectContacts('Pārdodu velosipēdu par 250 EUR. Izmērs 29 collas, svars 12 kg.');
      expect(res.hasContacts).toBe(false);
      expect(res.phones).toHaveLength(0);
      expect(res.emails).toHaveLength(0);
    });
  });

  describe('maskContacts', () => {
    it('masks phone numbers with [Slēpts tālrunis]', () => {
      const input = 'Zvani man uz +371 29123456 vai 28889900.';
      const masked = maskContacts(input);
      expect(masked).not.toContain('29123456');
      expect(masked).not.toContain('28889900');
      expect(masked).toContain('[Slēpts tālrunis]');
    });

    it('masks email addresses with [Slēpts e-pasts]', () => {
      const input = 'Mans e-pasts ir info@sellbuy.lv, raksti!';
      const masked = maskContacts(input);
      expect(masked).not.toContain('info@sellbuy.lv');
      expect(masked).toContain('[Slēpts e-pasts]');
    });

    it('leaves clean text unaltered', () => {
      const input = 'Labdien, vai prece vēl ir pieejama?';
      expect(maskContacts(input)).toBe(input);
    });
  });

  describe('canRevealContacts', () => {
    const chatBase = {
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
    };

    it('denies reveal if neither mutual exchange nor L2 verification exists', () => {
      const chat = {
        ...chatBase,
        messages: [{ senderId: 'buyer-1' }, { senderId: 'buyer-1' }],
      };
      const user = { id: 'buyer-1', isVerified: false, verifiedTypes: [] };
      const status = canRevealContacts(chat, user);
      expect(status.canReveal).toBe(false);
      expect(status.reason).toBe('requires_mutual_or_l2');
    });

    it('allows reveal if mutual exchange occurred (both parties sent messages)', () => {
      const chat = {
        ...chatBase,
        messages: [
          { senderId: 'buyer-1' },
          { senderId: 'seller-1' },
        ],
      };
      const user = { id: 'buyer-1', isVerified: false, verifiedTypes: [] };
      const status = canRevealContacts(chat, user);
      expect(status.canReveal).toBe(true);
      expect(status.reason).toBe('mutual_exchange');
    });

    it('allows reveal immediately if user is L2 verified via Smart-ID', () => {
      const chat = {
        ...chatBase,
        messages: [{ senderId: 'buyer-1' }],
      };
      const user = { id: 'buyer-1', isVerified: true, verifiedTypes: ['smart-id'] };
      const status = canRevealContacts(chat, user);
      expect(status.canReveal).toBe(true);
      expect(status.reason).toBe('l2_verified');
    });

    it('denies reveal if user is not participant of the chat', () => {
      const chat = {
        ...chatBase,
        messages: [{ senderId: 'buyer-1' }, { senderId: 'seller-1' }],
      };
      const user = { id: 'third-party', isVerified: true, verifiedTypes: ['smart-id'] };
      const status = canRevealContacts(chat, user);
      expect(status.canReveal).toBe(false);
      expect(status.reason).toBe('unauthorized');
    });
  });

  describe('auditRevealEvent', () => {
    it('creates audit event data with phone.revealed structure', () => {
      const event = auditRevealEvent('chat-123', 'buyer-1', { recipientId: 'seller-1', reason: 'mutual_exchange' });
      expect(event.event).toBe('phone.revealed');
      expect(event.chatId).toBe('chat-123');
      expect(event.userId).toBe('buyer-1');
      expect(event.timestamp).toBeDefined();
    });
  });
});
