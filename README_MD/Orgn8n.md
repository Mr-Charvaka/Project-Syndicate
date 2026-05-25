---
name: Serene Logic
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e4e2e0'
  on-surface: '#1b1c1a'
  on-surface-variant: '#464741'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ee'
  outline: '#777771'
  outline-variant: '#c7c7bf'
  surface-tint: '#5f5e5c'
  primary: '#020302'
  on-primary: '#ffffff'
  primary-container: '#1d1d1b'
  on-primary-container: '#868582'
  inverse-primary: '#c8c6c3'
  secondary: '#5d5f5d'
  on-secondary: '#ffffff'
  secondary-container: '#e0e0de'
  on-secondary-container: '#616362'
  tertiary: '#020202'
  on-tertiary: '#ffffff'
  tertiary-container: '#1e1c1d'
  on-tertiary-container: '#888485'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2de'
  primary-fixed-dim: '#c8c6c3'
  on-primary-fixed: '#1c1c1a'
  on-primary-fixed-variant: '#474744'
  secondary-fixed: '#e2e2e1'
  secondary-fixed-dim: '#c6c7c5'
  on-secondary-fixed: '#1a1c1b'
  on-secondary-fixed-variant: '#454746'
  tertiary-fixed: '#e7e1e2'
  tertiary-fixed-dim: '#cbc5c6'
  on-tertiary-fixed: '#1d1b1c'
  on-tertiary-fixed-variant: '#494647'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2e0'
typography:
  h1:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is rooted in the "Quiet Luxury" of digital interfaces. It prioritizes clarity, intellectual focus, and a sense of calm efficiency. The brand personality is scholarly yet modern—acting as a neutral vessel for high-value content. 

The design style is **High-End Minimalism**. It avoids decorative flourishes in favor of structural integrity, using purposeful whitespace to reduce cognitive load. The emotional response is one of trust and tranquility, positioning the product as a tool for deep work and sophisticated thought.

## Colors

The palette is strictly curated to eliminate visual noise. 
- **Primary:** Deep charcoal (#1D1D1B) is reserved for primary text and high-importance interaction states.
- **Secondary:** Soft gray (#E8E8E6) is used for subtle structural dividers and secondary button backgrounds.
- **Background:** The canvas uses a warm off-white (#F9F9F8) to reduce eye strain compared to pure white.
- **Neutral:** Medium grays are used for metadata and placeholder text to maintain a clear visual hierarchy.

Colors are applied with restraint; emphasis is created through weight and scale rather than hue.

## Typography

The design system utilizes **Inter** for its exceptional readability and utilitarian precision. The typographic scale is designed for long-form reading and clear data presentation. 

Headlines use slightly tighter letter spacing and a medium weight to feel grounded. Body text is prioritized with generous line heights (1.6x) to ensure maximum legibility during extended sessions. Labels utilize a subtle uppercase treatment and increased tracking for distinct categorization without requiring heavy containers.

## Layout & Spacing

This design system employs a **Fixed-Fluid Hybrid** layout. Content resides within a maximum width container (1200px) to prevent overly long line lengths, while background elements and utilities extend to the screen edge.

The spacing rhythm follows a strict 4px base unit. Whitespace is used as a primary separator; where a traditional system might use a background block, this system uses an extra increment of padding (`xl` or `xxl`). Margins are generous, ensuring that every interface element has "room to breathe."

## Elevation & Depth

Hierarchy is established through **Low-Contrast Outlines** and tonal layering rather than shadows. 
- **Borders:** Hairline borders (1px) in #E8E8E6 are the primary method of containment.
- **Layers:** Modals and popovers use a slightly brighter white (#FFFFFF) against the off-white background to indicate elevation.
- **Shadows:** When necessary for functional depth (e.g., a floating action button or a modal), use a single, highly diffused shadow: `0 10px 30px rgba(29, 29, 27, 0.04)`. It should be almost imperceptible, suggesting a lift rather than a drop.

## Shapes

The design system uses a **Soft** shape language. A base radius of 4px (`roundedness: 1`) is applied to standard components like buttons and input fields. This subtle rounding removes the "sharpness" of a purely brutalist grid while maintaining a professional, structured appearance. Larger containers or cards may use 8px (`rounded-lg`) to further soften the layout without becoming overly playful.

## Components

- **Buttons:** Primary buttons are solid #1D1D1B with white text. Secondary buttons use a hairline border (#E8E8E6) with charcoal text. Hover states involve a subtle background shift to a lighter gray rather than a color change.
- **Input Fields:** Minimalist containers with a 1px border. On focus, the border transitions from #E8E8E6 to #1D1D1B. Labels should sit above the field in the "label" typographic style.
- **Cards:** Cards should not have shadows by default. Use a 1px border and a background of #FFFFFF to distinguish them from the #F9F9F8 page background.
- **Lists:** Clean rows separated by 1px hairline horizontal rules. Use generous vertical padding (`md` or `lg`) to prevent information density from feeling overwhelming.
- **Chips:** Small, pill-shaped elements with #E8E8E6 backgrounds and 12px text. No borders.
- **Checkboxes/Radios:** Square (for checkboxes) and Circle (for radios) with a 1px charcoal stroke. When selected, they are filled with #1D1D1B.