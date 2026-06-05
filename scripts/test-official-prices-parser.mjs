#!/usr/bin/env node

import assert from "node:assert/strict";
import { extractInAppPurchasePairs } from "./collect-official-prices.mjs";

const html = `
  <div class="text-pair svelte-1gyt6l2"><span>ChatGPT Plus</span> <span>₺499,99</span></div>
  <div class="text-pair svelte-1gyt6l2"><span>ChatGPT Plus</span> <span>₺8.999,99</span></div>
  <div class="text-pair svelte-1gyt6l2"><span>100 Credits</span> <span>$4.00</span></div>
  <div class="text-pair svelte-1gyt6l2"><span>Developer</span> <span>OpenAI OpCo, LLC</span></div>
`;

const pairs = extractInAppPurchasePairs(html, "https://apps.apple.com/tr/app/chatgpt/id6448311069");

assert.equal(pairs.length, 3);
assert.deepEqual(
  pairs.map((item) => [item.title, item.priceText]),
  [
    ["ChatGPT Plus", "₺499,99"],
    ["ChatGPT Plus", "₺8.999,99"],
    ["100 Credits", "$4.00"],
  ],
);
assert.ok(pairs.every((item) => item.sourceUrl === "https://apps.apple.com/tr/app/chatgpt/id6448311069"));
assert.ok(pairs.every((item) => item.rawSnippetHash.length === 16));

console.log("official price parser test passed");
