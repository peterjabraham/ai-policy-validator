# Design System Reference

This document captures the design tokens and UI recipes used in this repo so you can
build other apps with the same look and feel.

## Brand and Mood
- Dark, low-glare background
- Cool blue accent for actions and links
- High-contrast primary text with muted secondary copy

## Color Palette (Tokens)
Token | Hex | Usage
--- | --- | ---
background | #0b0f14 | App background
foreground | #e6f0ff | Primary text
card | #1b2432 | Surfaces, panels, inputs
muted | #a9b6cb | Secondary text
border | #2a3547 | Dividers, borders
accent | #5B8DEF | Primary actions, links
accent.foreground | #ffffff | Text on accent surfaces
primary | #e6f0ff | Primary surfaces (same as foreground)
primary.foreground | #0b0f14 | Text on primary surfaces
secondary | #1b2432 | Secondary surfaces (same as card)
secondary.foreground | #e6f0ff | Text on secondary surfaces

## Typography
### Font Families
- Sans: Inter (weights 400, 900) via Google Fonts
- Mono: IBM Plex Mono with system fallbacks

### Type Scale (size / line-height)
- xs: 10px / 14px
- sm: 12px / 16px
- base: 14px / 20px
- lg: 16px / 24px
- xl: 20px / 28px
- 2xl: 24px / 32px
- 3xl: 28px / 36px

### Heading Styles
- H1: 3xl, font-black, tracking-tight
- H2: 2xl, font-black, tracking-tight
- H3: xl, font-black
- H4: lg, font-black
- Paragraph: base, text-muted

## Spacing, Radius, and Borders
- Border radius tokens: sm 8px, md 12px, lg 16px
- Borders: 1px in `border` color
- Common spacing: `p-4` for cards, `px-4 py-2` for buttons, `mb-3` for paragraphs

## Component Recipes (Tailwind Utility Classes)
- `.btn`:
  `px-4 py-2 rounded-lg border border-border bg-card text-foreground font-medium text-sm transition-colors hover:bg-muted/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`
- `.btn-primary`:
  `bg-accent border-accent text-black hover:bg-accent/90`
- `.card`:
  `bg-card border border-border rounded-lg p-4`
- `.chip`:
  `inline-block border border-border rounded-full px-2 py-1 text-xs text-muted`
- `.label`:
  `text-sm text-muted mb-1.5`
- `.kicker`:
  `text-xs tracking-wider uppercase text-muted mb-1.5`
- `.tabular`:
  `font-variant-numeric: tabular-nums`

## Markdown Content Styling
- `.markdown` base text: `text-base text-foreground`
- Headings: bold and larger with generous top margins
- Code: `font-mono text-sm` with card-like background
- Blockquote: left border in accent, italic muted text
- Links: `text-accent` with underline on hover

## Motion
- `pulse-subtle`: 2s opacity pulse for gentle emphasis

## Implementation Notes
- Apply `bg-background text-foreground font-sans` to the `body`.
- Use `text-accent` for links and `btn-primary` for primary actions.
- If you want pixel-identical mono text, load IBM Plex Mono as a web font.

## Sources
- `tailwind.config.ts`
- `app/globals.css`
