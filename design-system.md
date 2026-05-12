# Brand & Design System Guidelines: "Journey Audio"

## 1. Brand Essence & Vibe
- **Mission:** A dense audio-layer for the world, making history accessible right where it happened.
- **Target Audience:** The Independent Explorer (tech-savvy, values low-friction experiences).
- **Vibe / Inspiration:** "Editorial Precision." Blends the high-end, pixel-perfect polish of Linear and Apple with the bold, utilitarian clarity of Freitag. 
- **Core Principles:** 1. **High Contrast:** Must be readable outdoors on a sunny day.
  2. **Glanceable:** Minimal reading required; let the layout breathe.
  3. **Wayfinding:** Use the Accent color strictly to guide the user's eye, like a glowing GPS pin on a stark map.

## 2. Color System
The theme is **Light**, focusing on stark contrasts with a single neon punch. Do not introduce unapproved grays or colors.
- **Background:** `#FDFAFA` (Warm off-white. Reduces eye strain while feeling premium).
- **Primary Text & High-Emphasis Elements:** `#0E0E0E` (Near black. Use for headings, primary buttons, and borders).
- **Secondary Text & Low-Emphasis Elements:** `#575757` (Dark gray. Use for body copy, secondary icons).
- **Accent & Links:** `#E26FFF` (Neon Magenta. Use *sparingly*—only for hover states, active links, GPS/location icons, and the primary CTA).
- **Surface / Cards:** `#FFFFFF` (Pure white. Use to create subtle elevation against the off-white background).
- **Subtle Borders:** `#EBEBEB` (Use for separating content in grids/lists).

## 3. Typography System
**Primary Font:** `Inter` (sans-serif). 
*Instruction for AI:* Always apply `-0.02em` or `-0.04em` tracking (letter-spacing) to headings to give it that tight, "Linear-esque" premium tech feel.

- **Display / H1:** 56px | Weight: 600 (Semibold) | Line-height: 1.1 | Tracking: tight
- **H2:** 36px | Weight: 500 (Medium) | Line-height: 1.2 | Tracking: tight
- **H3 (Added for component titles):** 24px | Weight: 500 | Line-height: 1.3
- **Body Large / Lead (Your 28px):** 28px | Weight: 400 | Line-height: 1.5 | *Use for intro text or highly glanceable app-like screens.*
- **Body Base (Added for standard UI):** 18px | Weight: 400 | Line-height: 1.6 | *Use for standard paragraph text to maintain web conventions.*
- **Caption/Label:** 14px | Weight: 500 | Line-height: 1.4 | Text-transform: uppercase (occasionally, for "freitag-style" utilitarian tags).

## 4. Spacing & Grid (The "Bento" & "Linear" Influence)
- **Base Unit:** `4px`
- **Spacing Scale:** Apply standard Tailwind spacing metrics (4, 8, 16, 24, 32, 48, 64, 96, 128).
- **Layout:** Use max-width containers (e.g., `max-w-6xl`). Center the content. 
- **Whitespace:** Be incredibly generous with vertical padding between sections (e.g., `py-24` or `py-32`).

## 5. UI Component Architecture
- **Buttons (Primary):** Background `#0E0E0E`, Text `#FDFAFA`. Fully rounded (`rounded-full` like Apple) OR completely square (`rounded-none` like Freitag). *Pick one and stick to it.* Hover state: Background shifts to `#E26FFF`.
- **Buttons (Secondary):** Background transparent, Border 1px solid `#0E0E0E`, Text `#0E0E0E`. 
- **Cards/Containers:** Background `#FFFFFF`. No drop shadows. Instead, use a 1px solid border (`border-[#EBEBEB]`) for a flat, modern, neo-brutalist tech look. **Corner Radius:** `4px` (`rounded` in Tailwind) for all cards, inputs, and buttons. Apply consistently across all UI components.
- **Iconography:** `Phosphor Icons`. Use the "Regular" or "Light" weights. Icons should generally be `#0E0E0E`, but use `#E26FFF` for location/audio specific icons.

## 6. Motion & Interaction (Superhuman/Linear Style)
- Keep animations incredibly fast and subtle. No slow fades.
- Duration: `150ms` or `200ms`.
- Easing: `ease-out`.
- **Micro-interactions:** Buttons should slightly scale down (`scale-95`) on click. Links should have a subtle underline animation on hover.

## 7. Developer Instructions (Rules for the AI)
1. **Use Tailwind CSS** for all styling, mapping the hex codes to custom config variables (e.g., `bg-brand-background`, `text-brand-accent`).
2. **Prioritize semantic HTML.**
3. **Mobile-first.** Since this targets walking tourists, the mobile responsive view must be flawless, with massive, easily tappable touch targets (minimum `48px` height for buttons).
4. Do not use gradients or drop-shadows unless explicitly asked. Stick to flat colors, borders, and typography to create visual hierarchy.