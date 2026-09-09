/**
 * SellBuy.lv Design System
 * 
 * Inspired by: Linear (precision), Stripe (clarity), Vercel (dark theme craft)
 * Following impeccable skill principles: bold POV, no hedging, production-grade craft
 * 
 * ANTI-PATTERNS AVOIDED:
 * - No gradient mesh vomit (single subtle gradient on hero only)
 * - No emoji scatter (Lucide icons throughout)
 * - No glass-morphism vomit (reserved for nav + modal overlays only)
 * - No cookie-cutter cards (each card type has distinct treatment)
 * - No sameface (visual hierarchy through size, weight, and color)
 * - No checklist theater (real trust signals, not emoji+bold)
 * - No giant words/tiny thought (specific, meaningful copy)
 */

// Color palette — NOT shadcn defaults. Custom palette inspired by Linear's precision.
export const colors = {
  // Background layers (darkest to lightest)
  bg: {
    base: 'bg-[#0a0a0f]',           // Page background — near-black with blue undertone
    surface: 'bg-[#12121a]',         // Card/panel backgrounds
    elevated: 'bg-[#1a1a25]',        // Hovered cards, dropdowns
    overlay: 'bg-[#1a1a25]/95',      // Modal overlays
  },
  
  // Text hierarchy (brightest to dimmest)
  text: {
    primary: 'text-[#f0f0f5]',       // Headlines, primary actions
    secondary: 'text-[#8888a0]',     // Body text, descriptions
    tertiary: 'text-[#55556a]',      // Captions, metadata, timestamps
    inverse: 'text-[#0a0a0f]',       // Text on light backgrounds
  },
  
  // Accent — violet spectrum (NOT shadcn's generic blue)
  accent: {
    primary: '#7c3aed',              // Primary actions, links, focus states
    hover: '#6d28d9',                // Hover state
    subtle: '#7c3aed/10',            // Backgrounds, badges
    border: '#7c3aed/20',            // Borders, dividers
  },
  
  // Semantic colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Border colors
  border: {
    subtle: 'border-[#1f1f2e]',      // Default card borders
    interactive: 'border-[#2a2a3a]', // Hovered/focused borders
    accent: 'border-[#7c3aed/20]',   // Accent borders
  },
} as const;

// Typography scale — NOT font-black everywhere. Intentional hierarchy.
export const typography = {
  // Display — hero headlines only, used sparingly
  display: 'text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.1]',
  
  // H1 — page titles
  h1: 'text-3xl sm:text-4xl font-semibold tracking-tight leading-tight',
  
  // H2 — section titles
  h2: 'text-2xl font-semibold tracking-tight',
  
  // H3 — subsection titles
  h3: 'text-lg font-medium tracking-tight',
  
  // Body — descriptions, content
  body: 'text-[15px] leading-relaxed',
  
  // Small — metadata, captions
  small: 'text-sm leading-normal',
  
  // Micro — badges, tags, timestamps
  micro: 'text-xs font-medium uppercase tracking-wider',
} as const;

// Spacing — generous, intentional (NOT random p-4 everywhere)
export const spacing = {
  section: 'py-20 sm:py-28',        // Between major sections
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  cardPadding: 'p-6 sm:p-8',        // Inside cards
  gridGap: 'gap-6',                  // Between grid items
} as const;

// Component patterns — NOT glass-morphism on everything
export const components = {
  // Card — subtle, not glass-morphism
  card: 'rounded-2xl border border-[#1f1f2e] bg-[#12121a] transition-all duration-200',
  cardHover: 'hover:border-[#2a2a3a] hover:bg-[#15151f]',
  
  // Button — clean, not overloaded
  buttonPrimary: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium rounded-xl px-6 py-3 transition-all duration-150',
  buttonSecondary: 'border border-[#2a2a3a] text-[#f0f0f5] hover:bg-[#1a1a25] rounded-xl px-6 py-3 transition-all duration-150',
  buttonGhost: 'text-[#8888a0] hover:text-[#f0f0f5] hover:bg-[#1a1a25] rounded-xl px-4 py-2 transition-all duration-150',
  
  // Input — clean, accessible
  input: 'bg-[#12121a] border border-[#1f1f2e] rounded-xl px-4 py-3 text-[#f0f0f5] placeholder:text-[#55556a] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed/20] transition-all duration-150',
  
  // Badge — subtle, not shouty
  badge: 'bg-[#7c3aed/10] text-[#a78bfa] text-xs font-medium rounded-lg px-2.5 py-1',
  
  // Section header — NOT "Singalong Section Header"
  sectionTitle: 'text-2xl font-semibold tracking-tight text-[#f0f0f5]',
  sectionSubtitle: 'text-[15px] text-[#8888a0] mt-2 max-w-2xl',
} as const;

// Shadows — subtle, not glass-morphism blur
export const shadows = {
  card: 'shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
  elevated: 'shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
  glow: 'shadow-[0_0_20px_rgba(124,58,237,0.15)]',
} as const;
