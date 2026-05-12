# Product

## Register

product

## Users

PriceAI has two primary user groups.

The first group is buyers comparing AI subscription and account channels. They usually know the platform they want, such as ChatGPT, Claude, Gemini, Grok, Google, API/CDK, or email accounts, but do not want to open many card sites one by one just to compare price and stock. They need a fast, direct view of available offers, unavailable offers, source names, original product titles, and purchase links.

The second group is the site operator. The operator reviews submitted channels, confirms whether a source can be automatically collected, merges duplicate sources, and keeps source collectors healthy. The operator does not want manual price entry as a normal workflow. If a channel cannot be collected automatically today, it should become a collector-development todo, not a long-term manual-maintenance burden.

## Product Purpose

PriceAI is a focused AI subscription price comparison tool. It groups noisy card-site goods into standard products, then shows multi-source offers with a simple status model: in stock or out of stock.

The product exists to make price comparison faster and more trustworthy than visiting each source manually. Success means users can answer three questions in seconds: what is the lowest available price, which source provides it, and when the data was last collected.

The admin workflow must protect data quality. A submitted channel should first be parsed, then test-collected, then approved into the official source and offer tables only when it either matches an existing source or produces collectible offers. Unsupported channels should be retained as collector todos for future parser work.

## Brand Personality

Practical, restrained, and credible.

The product should feel like a professional working tool rather than a marketing site. It can have a refined editorial touch through the PriceAI wordmark, serif headings, and calm spacing, but the dominant impression must be clarity, not decoration.

Copy should be direct. It should explain data state and next actions without vague trust language, unnecessary scoring systems, or overloaded categories. The interface should avoid mystical credibility labels and keep core statuses concrete.

## Anti-references

Do not make PriceAI feel like a landing page, coupon site, or decorative SaaS showcase. Avoid oversized hero sections, flashy gradients, generic AI-dashboard decoration, empty marketing claims, and repeated card grids that hide the core comparison job.

Do not bury comparison behind multiple clicks. The product should prioritize tables, compact lists, clear filters, and direct source links.

Do not normalize manual maintenance as the default. Manual entry may exist for debugging, but the product direction is automated collection from original sources.

Do not introduce complex inventory labels beyond in stock and out of stock unless the user explicitly asks for them. The visible product language should stay simple.

## Design Principles

1. **Available price first.** Outside list views should show the lowest in-stock price. Out-of-stock prices can be visible in details, but they must not masquerade as usable lowest prices.

2. **Raw source transparency.** Every comparison should preserve the original channel, original product title, price, status, update time, and purchase link.

3. **Automation over manual work.** Submitted channels move through parse, test collect, approve, or collector todo. Manual price maintenance is not a product goal.

4. **Dense but readable.** The product should support scanning many offers quickly. Tables, compact rows, stable columns, and predictable controls are preferred over decorative layouts.

5. **Familiar controls win.** Use standard search, filters, segmented view toggles, table rows, chips, and clear buttons. Novel interaction patterns need a strong reason.

## Accessibility & Inclusion

Target WCAG 2.1 AA for contrast, keyboard access, focus states, and form labeling.

Do not rely on color alone for stock state. Status text must always accompany green or red treatment.

Motion should be minimal and state-driven. The product is primarily a reading and comparison tool, so transitions should not slow scanning or make data feel unstable.
