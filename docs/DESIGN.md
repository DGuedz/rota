# Design System Strategy: Institutional Brutalism

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Sovereign Institution."** 

This is not a typical Web3 "startup" aesthetic. It is a visual manifesto that blends the raw, structural honesty of Brutalism with the refined precision of high-end editorial design. We are moving away from the "app-like" feel of rounded corners and playful gradients toward an "onchain-native" terminal that feels authoritative, technical, and timeless.

The system breaks the "template" look by utilizing intentional asymmetry—where white space is treated as a physical material—and a rigid, zero-radius geometry. We emphasize the "Institutional" through high-contrast serif headlines that feel like a heritage broadsheet, juxtaposed against a clinical, sans-serif UI.

## 2. Color & Tonal Architecture
The palette is rooted in the earth and the machine: **ROTA Bone** provides a warm, tactile canvas, while **ROTA Black** delivers absolute weight. **Signal Gold** and **Route Amber** are not merely accents; they are functional signals—the "glow" of the machine.

### The "No-Line" Rule
To maintain a premium, bespoke feel, designers are prohibited from using 1px solid borders for structural sectioning. Standard grids are "expected"; we aim for "intentional." 
- **Structural Separation:** Define page sections solely through background shifts. Use `surface-container-low` (#f6f4ec) against the base `surface` (#fbf9f2) to denote a change in content.
- **Nesting Hierarchy:** Treat the UI as a series of stacked parchment. An inner module should use `surface-container-high` to sit "above" its parent without needing a drop shadow.

### Signature Textures & Effects
- **The Active Glow:** Active states for buttons or high-priority notifications must use a "Signal Gold Glow." This is achieved with a soft, diffused `primary_container` shadow (e.g., `box-shadow: 0 0 20px rgba(232, 195, 0, 0.3)`).
- **Glassmorphism for Technicality:** For floating navigation or modal overlays, use semi-transparent `surface` colors with a `20px` backdrop-blur. This mimics a frosted glass lens over a ledger, maintaining the onchain-native feel.

## 3. Typography: The Editorial Contrast
We use typography to create a "Technical vs. Humanist" dialogue.

- **Display & Headlines (Instrument Serif / Newsreader):** Used for narrative, page titles, and storytelling. These should be set with tight tracking and generous leading to feel like a high-end publication.
- **UI & Body (Inter / IBM Plex Sans):** The "engine room" of the system. Used for data, labels, and functional text.
- **The Metadata Tier:** Labels should be set in `label-sm` (Inter, 11px) with uppercase styling and increased letter spacing to mimic serial numbers on a technical schematic.

## 4. Elevation & Depth
This design system rejects the "card-and-shadow" meta of the last decade. Depth is achieved through **Tonal Layering.**

- **The Layering Principle:** Use the `surface-container` tiers (Lowest to Highest) to stack elements. A "card" is simply a box of `surface-container-lowest` (#ffffff) sitting on a `surface-container` (#f0eee7) background.
- **The "Ghost Border" Fallback:** If a container requires a boundary for accessibility, use a "Ghost Border"—the `outline-variant` (#d0c6ac) at 15% opacity. It should be felt, not seen.
- **Ambient Shadows:** Shadows are reserved only for critical "floating" elements like Tooltips. They must be hyper-diffused: `0px 12px 32px rgba(10, 10, 10, 0.04)`.

## 5. Components

### Buttons
- **Primary:** ROTA Black background, ROTA Bone text. 0px radius. 
- **State:** On hover, apply the **Signal Gold Glow** and shift background to `primary` (#705d00).
- **Secondary:** Transparent background with a 1px `outline` (#7e7760).

### Input Fields
- **Styling:** No four-sided boxes. Use a 1px bottom-border only (the "Institutional Line").
- **Focus State:** The bottom border transforms into **Signal Gold** with a subtle 2px glow underneath.

### Data Lists & Ledgers
- **The "No-Divider" Rule:** Never use horizontal lines to separate list items. Use vertical whitespace and alternating `surface-container-low` background fills for "zebra" stripping to maintain a clean, brutalist aesthetic.

### Onchain Status Chips
- **Styling:** Small, rectangular, 0px radius.
- **Active:** Signal Gold background with ROTA Black mono-spaced text. This signifies a "live" state on the network.

## 6. Do’s and Don’ts

### Do
- **Use Massive Margins:** Create "breathing room" that feels expensive and intentional.
- **Align to a Rigid Grid:** Every element must feel "locked" into a technical structure.
- **Embrace Asymmetry:** Place your display type off-center to break the "template" feel.
- **Prioritize Clarity:** If a decorative element doesn't aid understanding, delete it.

### Don’t
- **No Border Radius:** Never use a radius. The system is 0px. Softness comes from color, not shape.
- **No Standard Blue:** Avoid "internet blue." Use Signal Gold or Route Amber for all utility and action states.
- **No Heavy Shadows:** Shadows should never be dark grey. They should be a faint tint of the background color.
- **No 100% Opaque Dividers:** High-contrast lines create visual "noise" that destroys the premium editorial feel.