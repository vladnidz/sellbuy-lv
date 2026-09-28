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

// Color palette — Custom palette mapped to CSS variables in globals.css
export const colors = {
  // Background layers (darkest to lightest)
  bg: {
    base: 'bg-base',           // Page background
    surface: 'bg-surface',         // Card/panel backgrounds
    elevated: 'bg-elevated',        // Hovered cards, dropdowns
  },
  
  // Text hierarchy
  text: {
    primary: 'text-text-primary',       // Headlines, primary actions
    secondary: 'text-text-secondary',     // Body text, descriptions
  },
  
  // Accent
  accent: {
    primary: 'text-accent',              // Primary actions, links, focus states
    hover: 'text-accent-hover',                // Hover state
  },
  
  // Border colors
  border: {
    subtle: 'border-border',      // Default card borders
  },
} as const;

// Typography scale
export const typography = {
  display: 'text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.1]',
  h1: 'text-3xl sm:text-4xl font-semibold tracking-tight leading-tight',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-lg font-medium tracking-tight',
  body: 'text-[15px] leading-relaxed',
  small: 'text-sm leading-normal',
  micro: 'text-xs font-medium uppercase tracking-wider',
} as const;

// Spacing
export const spacing = {
  section: 'py-20 sm:py-28',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  cardPadding: 'p-6 sm:p-8',
  gridGap: 'gap-6',
} as const;

// Component patterns
export const components = {
  // Card
  card: 'rounded-2xl border border-border bg-surface transition-all duration-200',
  
  // Button
  buttonPrimary: 'bg-accent hover:bg-accent-hover text-white font-medium rounded-xl px-6 py-3 transition-all duration-150',
  buttonSecondary: 'border border-border text-text-primary hover:bg-elevated rounded-xl px-6 py-3 transition-all duration-150',
} as const;
