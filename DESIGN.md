---
name: PriceAI
description: AI subscription price comparison and source collection tool.
colors:
  ink: "#202829"
  text: "#2d3435"
  text-muted: "#5a6061"
  background: "#f9f9f9"
  surface: "#f2f4f4"
  surface-selected: "#dde4e5"
  surface-hover: "#ebeeef"
  border-muted: "#adb3b4"
  white-tinted: "#f8f8f8"
  success-bg: "#e8f3ec"
  success-text: "#2f7a4b"
  warning-bg: "#fff7e8"
  warning-text: "#7a541b"
  info-bg: "#eef3f8"
  info-text: "#47657a"
  danger-bg: "#fbe9e7"
  danger-text: "#9b3328"
  brand-green: "#45bf78"
typography:
  display:
    fontFamily: "Noto Serif SC, Songti SC, SimSun, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "0"
  title:
    fontFamily: "Manrope, PingFang SC, Microsoft YaHei, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0"
  body:
    fontFamily: "Manrope, PingFang SC, Microsoft YaHei, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  label:
    fontFamily: "Manrope, PingFang SC, Microsoft YaHei, Arial, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.14em"
rounded:
  sm: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.white-tinted}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "44px"
  button-soft:
    backgroundColor: "{colors.surface-selected}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "0 20px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.surface-selected}"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
  input-pill:
    backgroundColor: "#ffffff"
    textColor: "{colors.text}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
---

# Design System: PriceAI

## 1. Overview

**Creative North Star: "The Price Desk"**

PriceAI should feel like a calm comparison desk for noisy AI subscription markets. The interface has a restrained editorial surface, but its real job is operational: scan, compare, verify, and move quickly to the original source.

The visual system uses soft tinted neutrals, compact controls, light borders, and table-first information hierarchy. The PriceAI logo and serif headings add identity, while the surrounding UI stays familiar and work-focused.

This system rejects marketing-site composition, decorative AI motifs, heavy gradients, and ambiguous trust badges. Data should look specific, current, and easy to challenge.

**Key Characteristics:**
- Table-first comparison with card view as a secondary option.
- Rounded pill controls for search, filters, tabs, and primary actions.
- Soft green and red status chips, always paired with explicit text.
- Brand icons for platforms and source context.
- Minimal motion, only for hover and state feedback.

## 2. Colors

The palette is a restrained warm-gray product system with one fresh green brand accent and semantic colors for inventory and review states.

### Primary

- **Ink Black-Green** (`#202829`): Logo text, headings, table emphasis, and primary text moments.
- **Working Charcoal** (`#2d3435`): Primary buttons, body foreground, and control text.
- **Radar Green** (`#45bf78`): Logo signal line and occasional brand-positive accents. Use sparingly.

### Secondary

- **Muted Slate** (`#5a6061`): Secondary labels, timestamps, helper text, and inactive controls.
- **Panel Mist** (`#f2f4f4`): Sticky platform nav, table headers, metric tiles, and subtle grouped panels.
- **Selected Mist** (`#dde4e5`): Active platform tabs and selected soft controls.

### Neutral

- **Page White-Gray** (`#f9f9f9`): Main page background.
- **Tinted White** (`#f8f8f8`): Primary button text and light logo fill.
- **Border Fog** (`#adb3b4`): Low-opacity rings, dividers, and stable container boundaries.

### Semantic

- **Available Green** (`#e8f3ec` / `#2f7a4b`): In-stock counts, available status chips, positive probe results.
- **Out-of-stock Red** (`#fbe9e7` / `#9b3328`): Out-of-stock chips and unavailable row emphasis.
- **Warning Amber** (`#fff7e8` / `#7a541b`): Parse warnings, caveats, and non-blocking attention.
- **Info Blue** (`#eef3f8` / `#47657a`): Neutral system information and secondary status.

### Named Rules

**The Status Text Rule.** Green and red never stand alone. Every inventory indicator must say "有货" or "缺货".

**The Accent Scarcity Rule.** Radar Green belongs to brand signal and success state emphasis. It should not become decorative page chrome.

## 3. Typography

**Display Font:** Noto Serif SC with Songti SC, SimSun, Georgia fallback.
**Body Font:** Manrope with PingFang SC, Microsoft YaHei, Arial fallback.
**Label/Mono Font:** SFMono-Regular, Consolas, Liberation Mono for code-like snippets.

**Character:** Serif headings make the product feel named and deliberate; sans-serif body and table text keep comparison work fast and modern.

### Hierarchy

- **Display** (600-800, 2.25rem to 3rem, 1.12 line-height): Page titles and product detail names only.
- **Headline** (600, 1.5rem to 1.875rem, 1.2 line-height): Section titles and empty states.
- **Title** (700, 1rem, 1.35 line-height): Product names, source names, and important row labels.
- **Body** (400-500, 0.875rem, 1.7 line-height): Summaries, helper text, admin explanations, and row metadata.
- **Label** (600, 0.68rem, 0.14em tracking): Table heads, metric labels, and compact metadata where uppercase styling is already used.

### Named Rules

**The Data Sans Rule.** Tables, form labels, buttons, filters, and prices use the sans stack. Serif is reserved for product identity and page-level hierarchy.

## 4. Elevation

The system uses tonal layering first and shadows second. Most surfaces are flat with light rings or borders. Shadows appear on major comparison containers, cards, and floating submit dialogs to separate working layers without making the interface feel glossy.

### Shadow Vocabulary

- **Soft Table Lift** (`0 20px 55px rgba(45,52,53,0.045)`): Main comparison tables and product cards.
- **Control Lift** (`0 16px 45px rgba(45,52,53,0.05)`): Search input and selected segmented controls.
- **Dialog Lift** (`0 30px 80px rgba(45,52,53,0.18)`): Modal submit flow only.

### Named Rules

**The Flat Table Rule.** Data rows should not float individually. Use dividers, row hover, and a shared container.

## 5. Components

### Buttons

- **Shape:** Full pills for user-facing actions. Admin utility buttons may stay rectangular when density matters.
- **Primary:** Working Charcoal background, Tinted White text, 44px height, medium-to-bold weight.
- **Hover / Focus:** Darken charcoal or shift soft backgrounds slightly. Focus states should use visible rings or border changes.
- **Secondary / Soft:** Panel Mist or Selected Mist backgrounds with charcoal text.

### Chips

- **Style:** Full pills with soft semantic backgrounds and compact bold text.
- **State:** Platform tabs use neutral selected mist. Inventory chips use Available Green or Out-of-stock Red.
- **Rule:** Chips are labels or filters, not explanations. Keep copy short.

### Cards / Containers

- **Corner Style:** 8px radius.
- **Background:** White for content containers, Panel Mist for grouped filters or hero-like detail panels.
- **Shadow Strategy:** Shared container lift for cards and tables, not nested shadows.
- **Border:** Low-opacity Border Fog rings on public surfaces; solid stone borders in dense admin panels.
- **Internal Padding:** 16px for compact admin panels, 24px for public cards, 40px only for major page rhythm.

### Inputs / Fields

- **Style:** Public controls are pill-shaped with white fill and low-opacity rings. Admin inputs are rectangular for density and clearer form alignment.
- **Focus:** Shift to darker neutral or green-tinted ring. Do not rely on color alone for errors.
- **Error / Disabled:** Error surfaces use red-tinted background and explicit message copy.

### Navigation

- **Public:** Sticky top logo header, sticky platform tab row on desktop, horizontal scroll when needed.
- **Admin:** Tab strip with count badges and clear active state.
- **Mobile:** Keep controls compact; platform filters can move into the filter panel.

### Tables

- **Header:** Panel Mist background, small bold labels, stable columns.
- **Rows:** Divider-separated with hover tint. Unavailable rows may use a light red-tinted background.
- **Actions:** Use compact primary pills for row-level "查看" or purchase actions.

## 6. Do's and Don'ts

Do show the lowest available price in list views.

Do expose source name, original product title, status, update time, and purchase link in detail views.

Do use official platform logos where available for ChatGPT, Claude, Gemini, Grok, Google, API/CDK, and email categories.

Do keep stock state to "有货" and "缺货" unless the product requirement changes.

Do make admin review actions explicit: try collect, approve and import, merge existing source, or add collector todo.

Don't show out-of-stock prices as the usable lowest price.

Don't use broad credibility scores, vague confidence labels, or multi-layer status jargon.

Don't make manual price entry feel like the default workflow.

Don't add nested cards, decorative blobs, gradient text, or marketing-style hero sections.

Don't let filters, labels, or buttons resize unpredictably when Chinese text is longer than expected.
