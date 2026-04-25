---
name: Luminous Dark
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c0c7d4'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8a919e'
  outline-variant: '#404752'
  surface-tint: '#a3c9ff'
  primary: '#a3c9ff'
  on-primary: '#00315c'
  primary-container: '#0078d4'
  on-primary-container: '#ffffff'
  inverse-primary: '#0060ab'
  secondary: '#74d1ff'
  on-secondary: '#003548'
  secondary-container: '#159ccb'
  on-secondary-container: '#002e3f'
  tertiary: '#ffb689'
  on-tertiary: '#512300'
  tertiary-container: '#bc5b00'
  on-tertiary-container: '#ffffff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d3e3ff'
  primary-fixed-dim: '#a3c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#c1e8ff'
  secondary-fixed-dim: '#74d1ff'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d67'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb689'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#743500'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2.5rem
  xl: 4rem
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system is built on the intersection of Windows' functional glass surfaces and Apple’s meticulous focus on soft legibility and negative space. The brand personality is sophisticated, calm, and high-end, targeting professional environments where visual fatigue must be minimized. 

The design style utilizes **Glassmorphism** combined with **Minimalism**. It relies on deep monochromatic layers to create a sense of infinite depth, punctuated by vibrant primary accents. The aesthetic goal is to feel like a premium hardware interface: tactile yet digital, dense yet airy.

## Colors

The palette is anchored by a true-dark background (#0B0B0B) to maximize OLED efficiency and contrast. The primary accent is the iconic Windows Blue (#0078D4), used sparingly for interactive states and call-to-actions. 

Text colors avoid pure white to reduce eye strain, opting instead for a range of "San Francisco" inspired grays. Secondary accents like #60CDFF are used for subtle highlights or active indicators. Transparency is a core color property here; surfaces are rarely solid, instead using low-opacity white tints to create "mica" or "acrylic" effects over the dark base.

## Typography

The design system utilizes **Inter** for its utilitarian precision and exceptional legibility in dark environments. The typographic hierarchy is strictly enforced through weight and color rather than just size. 

Headlines use semi-bold weights with slight negative letter spacing to mimic the "tight" premium look of San Francisco. Body text remains at a generous line height (1.5) to ensure long-form reading comfort against the dark background. Captions and labels use a slightly lighter gray to establish a clear information hierarchy.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with fixed logical breakpoints. It employs a 12-column system for desktop and a 4-column system for mobile. 

A 4px baseline grid governs all internal component spacing, while external spacing (margins and padding) follows a progressive scale. Emphasize horizontal breathing room; the "Apple" influence dictates that content should never feel crowded. Use generous margins (#lg) between major sections to allow the glassmorphic background blurs to be visible.

## Elevation & Depth

Depth is not communicated through heavy shadows, but through **Tonal Layers** and **Backdrop Blurs**. 

1.  **Level 0 (Base):** The solid #0B0B0B background.
2.  **Level 1 (Cards/Content):** A semi-transparent overlay (5% white) with a 20px - 40px backdrop blur. 
3.  **Level 2 (Popovers/Modals):** A lighter overlay (10% white) with a 60px blur and a subtle 1px white stroke at 10% opacity to define the edge.

Shadows, when used, are extremely large and diffused (blur > 30px) with very low opacity (15-20%), serving as an "ambient occlusion" rather than a direct light source indicator.

## Shapes

The design system uses a **Rounded** shape language to soften the technical nature of the dark mode. The standard radius is 12px for small components like buttons and inputs, and 16px for containers and cards. 

Large-scale layout containers (like sidebars or main content areas) may use up to 24px corner radii when nested. All strokes used for borders must be "inner" strokes to maintain the crispness of the geometry against the dark background.

## Components

-   **Buttons:** Primary buttons use the #0078D4 fill with white text. Secondary buttons use a glass effect (white 10% fill) with a 1px border. Interactions should include a subtle scale-down (98%) on click.
-   **Inputs:** Fields are dark with a 1px stroke (#border_subtle). On focus, the stroke changes to the primary blue and gains a soft blue outer glow (glow spread: 4px).
-   **Cards:** Use the Level 1 elevation (glassmorphism). Cards should have no visible shadow in their default state, only a subtle border. On hover, the background opacity increases slightly.
-   **Chips/Tags:** Pill-shaped with a 20% opacity version of the primary blue for the background and the full-strength blue for the text.
-   **Lists:** Dividers are kept to a minimum; use vertical spacing and "hover states" (a subtle 5% white highlight) to define rows.
-   **Acrylic Sidebar:** A signature component using high-intensity backdrop blur (80px) and a fixed width, acting as the primary navigation anchor.