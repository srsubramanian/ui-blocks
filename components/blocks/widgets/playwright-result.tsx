"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ─── Sample data ──────────────────────────────────────────────────────────
// A realistic 8-step checkout test that fails on the last step.
const SAMPLE_TEST = {
  title: "checkout › applies promo code and places order",
  file: "tests/checkout.spec.ts",
  line: 84,
  project: "chromium",
  duration: 8420,
  status: "failed" as const,
  failureSummary: {
    step: 8,
    message: "Element is not enabled",
    locator: "getByRole('button', { name: 'Place order' })",
    hint: 'Button stayed disabled — promo code "FALL20" failed to apply.',
  },
  steps: [
    { id: 1, action: "goto",  title: "Navigate to /shop",                    url: "https://shop.sunday.test/",                 status: "passed", duration: 412, selector: "page.goto",                                  variant: "shop" },
    { id: 2, action: "hover", title: 'Hover "Cozy Sweater" product card',    url: "https://shop.sunday.test/",                 status: "passed", duration: 180, selector: "getByText('Cozy Sweater')",                  variant: "shopHover" },
    { id: 3, action: "click", title: 'Click "Add to cart"',                  url: "https://shop.sunday.test/",                 status: "passed", duration: 220, selector: "getByRole('button', { name: 'Add to cart' })", variant: "added" },
    { id: 4, action: "click", title: "Open cart drawer",                     url: "https://shop.sunday.test/",                 status: "passed", duration: 145, selector: "getByLabel('Cart')",                         variant: "cart" },
    { id: 5, action: "click", title: "Continue to checkout",                 url: "https://shop.sunday.test/checkout",         status: "passed", duration: 380, selector: "getByRole('button', { name: 'Checkout' })",   variant: "checkoutEmpty" },
    { id: 6, action: "fill",  title: "Fill shipping address",                url: "https://shop.sunday.test/checkout",         status: "passed", duration: 540, selector: "form#shipping",                              variant: "checkoutFilled" },
    { id: 7, action: "fill",  title: "Enter card details",                   url: "https://shop.sunday.test/checkout/payment", status: "passed", duration: 612, selector: "getByLabel('Card number')",                  variant: "paymentFilled" },
    { id: 8, action: "click", title: 'Click "Place order"',                  url: "https://shop.sunday.test/checkout/payment", status: "failed", duration: 5000, selector: "getByRole('button', { name: 'Place order' })", variant: "paymentBroken" },
  ],
};

type Step = (typeof SAMPLE_TEST.steps)[number];
type Layout = "filmstrip" | "timeline" | "grid";

const fmtMs = (ms: number) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`);

const ACTION_LABEL: Record<string, string> = {
  goto: "Navigate", hover: "Hover", click: "Click", fill: "Fill", expect: "Assert", press: "Press",
};

// ─── Mock browser screenshots (SVGs) ──────────────────────────────────────
// Warm cream palette matched to the design's light theme. The Chrome wrapper
// draws the browser frame; each variant draws the page content.
const PALETTE = {
  bg: "#ffffff",
  chrome: "#f0ebdf",
  urlBar: "#ffffff",
  urlText: "#7c7565",
  ink: "#1c1a15",
  muted: "#eee7d6",
  accent: "#7b5cff",
  divider: "#e5dec9",
};

function Chrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <clipPath id="pwChromeContent">
          <rect x="0" y="32" width="800" height="468" />
        </clipPath>
      </defs>
      <rect width="800" height="500" fill={PALETTE.bg} />
      <rect x="0" y="0" width="800" height="32" fill={PALETTE.chrome} />
      <circle cx="14" cy="16" r="4.5" fill="#ff6259" />
      <circle cx="30" cy="16" r="4.5" fill="#ffbc2e" />
      <circle cx="46" cy="16" r="4.5" fill="#27c93f" />
      <rect x="70" y="8" width="500" height="16" rx="8" fill={PALETTE.urlBar} stroke={PALETTE.divider} />
      <text x="84" y="19" fontFamily="ui-monospace, monospace" fontSize="10" fill={PALETTE.urlText}>{url}</text>
      <g clipPath="url(#pwChromeContent)">{children}</g>
    </svg>
  );
}

function ContentShop({ hovered }: { hovered?: number }) {
  return (
    <g>
      <rect x="0" y="32" width="800" height="48" fill={PALETTE.bg} />
      <text x="40" y="62" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="18" fill={PALETTE.ink}>SUNDAY</text>
      <circle cx="710" cy="56" r="10" fill="none" stroke={PALETTE.ink} strokeWidth="1.5" />
      <path d="M 717 63 L 723 69" stroke={PALETTE.ink} strokeWidth="1.5" />
      <rect x="735" y="46" width="32" height="20" rx="10" fill={PALETTE.muted} />
      <text x="751" y="60" fontFamily="ui-monospace" fontSize="10" fill={PALETTE.ink} textAnchor="middle">0</text>
      <line x1="0" y1="80" x2="800" y2="80" stroke={PALETTE.divider} />
      <text x="40" y="130" fontFamily="Manrope, serif" fontWeight="700" fontSize="32" fill={PALETTE.ink}>Cozy season,</text>
      <text x="40" y="166" fontFamily="Manrope, serif" fontWeight="700" fontSize="32" fill={PALETTE.ink}>delivered.</text>
      {[0, 1, 2].map((i) => {
        const x = 40 + i * 245;
        const isHover = hovered === i;
        return (
          <g key={i}>
            <rect x={x} y="220" width="225" height="200" rx="12" fill={PALETTE.muted} stroke={isHover ? PALETTE.accent : "transparent"} strokeWidth="2" />
            <ellipse cx={x + 112} cy="305" rx="48" ry="38" fill={PALETTE.bg} opacity="0.7" />
            <rect x={x + 78} y="330" width="68" height="50" rx="8" fill={PALETTE.bg} opacity="0.7" />
            <text x={x + 12} y="440" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="12" fill={PALETTE.ink}>{["Cozy Sweater", "Linen Throw", "Wool Socks"][i]}</text>
            <text x={x + 12} y="458" fontFamily="ui-monospace" fontSize="11" fill={PALETTE.urlText}>{["$78.00", "$120.00", "$24.00"][i]}</text>
          </g>
        );
      })}
    </g>
  );
}

function ContentAdded() {
  return (
    <g>
      <ContentShop hovered={0} />
      <circle cx="115" cy="320" r="26" fill={PALETTE.accent} opacity="0.18" />
      <circle cx="115" cy="320" r="14" fill={PALETTE.accent} opacity="0.35" />
      <circle cx="115" cy="320" r="6" fill={PALETTE.accent} />
      <rect x="735" y="46" width="32" height="20" rx="10" fill={PALETTE.accent} />
      <text x="751" y="60" fontFamily="ui-monospace" fontWeight="700" fontSize="10" fill="white" textAnchor="middle">1</text>
      <rect x="540" y="430" width="230" height="44" rx="10" fill={PALETTE.ink} />
      <circle cx="562" cy="452" r="8" fill="#7ee08a" />
      <path d="M 558 452 L 561 455 L 566 449" stroke={PALETTE.ink} strokeWidth="2" fill="none" />
      <text x="580" y="450" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="11" fill="white">Cozy Sweater added</text>
      <text x="580" y="463" fontFamily="Manrope, sans-serif" fontSize="10" fill="rgba(255,255,255,0.6)">to your cart</text>
    </g>
  );
}

function ContentCart() {
  return (
    <g>
      <ContentShop />
      <rect x="0" y="32" width="800" height="468" fill="rgba(0,0,0,0.4)" />
      <rect x="500" y="32" width="300" height="468" fill={PALETTE.bg} />
      <text x="520" y="74" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="16" fill={PALETTE.ink}>Your cart</text>
      <text x="780" y="68" fontFamily="ui-monospace" fontSize="14" fill={PALETTE.ink} textAnchor="end">×</text>
      <line x1="500" y1="92" x2="800" y2="92" stroke={PALETTE.divider} />
      <rect x="520" y="110" width="60" height="60" rx="8" fill={PALETTE.muted} />
      <ellipse cx="550" cy="138" rx="18" ry="14" fill={PALETTE.bg} opacity="0.7" />
      <text x="592" y="128" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="12" fill={PALETTE.ink}>Cozy Sweater</text>
      <text x="592" y="144" fontFamily="Manrope, sans-serif" fontSize="11" fill={PALETTE.urlText}>Size M · Oat</text>
      <text x="592" y="166" fontFamily="ui-monospace" fontSize="11" fill={PALETTE.ink}>$78.00</text>
      <line x1="520" y1="200" x2="780" y2="200" stroke={PALETTE.divider} />
      <text x="520" y="380" fontFamily="Manrope, sans-serif" fontSize="11" fill={PALETTE.urlText}>Subtotal</text>
      <text x="780" y="380" fontFamily="ui-monospace" fontWeight="600" fontSize="13" fill={PALETTE.ink} textAnchor="end">$78.00</text>
      <rect x="520" y="410" width="260" height="48" rx="10" fill={PALETTE.ink} />
      <text x="650" y="440" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" fill={PALETTE.bg} textAnchor="middle">Checkout · $78.00</text>
      <circle cx="650" cy="434" r="34" fill={PALETTE.accent} opacity="0.15" />
      <circle cx="650" cy="434" r="18" fill={PALETTE.accent} opacity="0.30" />
      <circle cx="650" cy="434" r="6" fill={PALETTE.accent} />
    </g>
  );
}

function ContentCheckout({ filled = false, focusedField }: { filled?: boolean; focusedField?: string }) {
  return (
    <g>
      <rect x="0" y="32" width="800" height="48" fill={PALETTE.bg} />
      <text x="40" y="62" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="18" fill={PALETTE.ink}>SUNDAY</text>
      <text x="180" y="62" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="12" fill={PALETTE.urlText}>Cart › Shipping › Payment</text>
      <line x1="0" y1="80" x2="800" y2="80" stroke={PALETTE.divider} />
      <text x="40" y="118" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="20" fill={PALETTE.ink}>Shipping address</text>
      <text x="40" y="160" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="10" fill={PALETTE.urlText}>EMAIL</text>
      <rect x="40" y="170" width="460" height="36" rx="8" fill={PALETTE.bg} stroke={focusedField === "email" ? PALETTE.accent : PALETTE.divider} strokeWidth={focusedField === "email" ? 2 : 1} />
      {filled && <text x="54" y="193" fontFamily="ui-monospace" fontSize="12" fill={PALETTE.ink}>amelia@example.com</text>}
      <text x="40" y="232" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="10" fill={PALETTE.urlText}>FULL NAME</text>
      <rect x="40" y="242" width="460" height="36" rx="8" fill={PALETTE.bg} stroke={PALETTE.divider} />
      {filled && <text x="54" y="265" fontFamily="ui-monospace" fontSize="12" fill={PALETTE.ink}>Amelia Park</text>}
      <text x="40" y="304" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="10" fill={PALETTE.urlText}>STREET ADDRESS</text>
      <rect x="40" y="314" width="460" height="36" rx="8" fill={PALETTE.bg} stroke={PALETTE.divider} />
      {filled && <text x="54" y="337" fontFamily="ui-monospace" fontSize="12" fill={PALETTE.ink}>148 Forest Ln, Apt 3B</text>}
      <rect x="40" y="376" width="290" height="36" rx="8" fill={PALETTE.bg} stroke={PALETTE.divider} />
      <rect x="340" y="376" width="160" height="36" rx="8" fill={PALETTE.bg} stroke={PALETTE.divider} />
      {filled && (
        <>
          <text x="54" y="399" fontFamily="ui-monospace" fontSize="12" fill={PALETTE.ink}>Portland</text>
          <text x="354" y="399" fontFamily="ui-monospace" fontSize="12" fill={PALETTE.ink}>97214</text>
        </>
      )}
      <rect x="40" y="440" width="200" height="44" rx="10" fill={filled ? PALETTE.ink : PALETTE.muted} />
      <text x="140" y="467" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" fill={filled ? PALETTE.bg : PALETTE.urlText} textAnchor="middle">Continue to payment</text>
      {filled && (
        <>
          <circle cx="140" cy="462" r="22" fill={PALETTE.accent} opacity="0.18" />
          <circle cx="140" cy="462" r="8" fill={PALETTE.accent} />
        </>
      )}
      <rect x="550" y="118" width="220" height="220" rx="12" fill={PALETTE.muted} />
      <text x="568" y="146" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" fill={PALETTE.ink}>Order summary</text>
      <rect x="568" y="166" width="32" height="32" rx="6" fill={PALETTE.bg} />
      <ellipse cx="584" cy="182" rx="10" ry="8" fill={PALETTE.muted} />
      <text x="608" y="180" fontFamily="Manrope, sans-serif" fontSize="11" fill={PALETTE.ink}>Cozy Sweater</text>
      <text x="608" y="194" fontFamily="ui-monospace" fontSize="10" fill={PALETTE.urlText}>1 × $78.00</text>
      <line x1="568" y1="220" x2="752" y2="220" stroke={PALETTE.divider} />
      <text x="568" y="246" fontFamily="Manrope, sans-serif" fontSize="11" fill={PALETTE.urlText}>Subtotal</text>
      <text x="752" y="246" fontFamily="ui-monospace" fontSize="11" fill={PALETTE.ink} textAnchor="end">$78.00</text>
      <text x="568" y="268" fontFamily="Manrope, sans-serif" fontSize="11" fill={PALETTE.urlText}>Shipping</text>
      <text x="752" y="268" fontFamily="ui-monospace" fontSize="11" fill={PALETTE.ink} textAnchor="end">$6.00</text>
      <line x1="568" y1="288" x2="752" y2="288" stroke={PALETTE.divider} />
      <text x="568" y="316" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" fill={PALETTE.ink}>Total</text>
      <text x="752" y="316" fontFamily="ui-monospace" fontWeight="700" fontSize="13" fill={PALETTE.ink} textAnchor="end">$84.00</text>
    </g>
  );
}

function ContentPayment({ filled = false, broken = false }: { filled?: boolean; broken?: boolean }) {
  return (
    <g>
      <rect x="0" y="32" width="800" height="48" fill={PALETTE.bg} />
      <text x="40" y="62" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="18" fill={PALETTE.ink}>SUNDAY</text>
      <text x="180" y="62" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="12" fill={PALETTE.urlText}>Cart › Shipping › </text>
      <text x="328" y="62" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="12" fill={PALETTE.ink}>Payment</text>
      <line x1="0" y1="80" x2="800" y2="80" stroke={PALETTE.divider} />
      <text x="40" y="118" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="20" fill={PALETTE.ink}>Payment</text>
      <text x="40" y="160" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="10" fill={PALETTE.urlText}>CARD NUMBER</text>
      <rect x="40" y="170" width="460" height="42" rx="8" fill={PALETTE.bg} stroke={PALETTE.divider} />
      {filled && <text x="54" y="196" fontFamily="ui-monospace" fontSize="13" fill={PALETTE.ink}>4242 4242 4242 4242</text>}
      <rect x="450" y="180" width="36" height="22" rx="4" fill={PALETTE.accent} opacity="0.2" />
      <text x="468" y="195" fontFamily="ui-monospace" fontWeight="700" fontSize="9" fill={PALETTE.accent} textAnchor="middle">VISA</text>
      <text x="40" y="234" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="10" fill={PALETTE.urlText}>EXPIRY</text>
      <rect x="40" y="244" width="220" height="42" rx="8" fill={PALETTE.bg} stroke={PALETTE.divider} />
      {filled && <text x="54" y="270" fontFamily="ui-monospace" fontSize="13" fill={PALETTE.ink}>04 / 28</text>}
      <text x="280" y="234" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="10" fill={PALETTE.urlText}>CVC</text>
      <rect x="280" y="244" width="220" height="42" rx="8" fill={PALETTE.bg} stroke={PALETTE.divider} />
      {filled && <text x="294" y="270" fontFamily="ui-monospace" fontSize="13" fill={PALETTE.ink}>•••</text>}
      <text x="40" y="308" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="10" fill={PALETTE.urlText}>BILLING ZIP</text>
      <rect x="40" y="318" width="220" height="42" rx="8" fill={PALETTE.bg} stroke={PALETTE.divider} />
      {filled && <text x="54" y="344" fontFamily="ui-monospace" fontSize="13" fill={PALETTE.ink}>97214</text>}
      {broken ? (
        <>
          <rect x="40" y="394" width="220" height="48" rx="10" fill={PALETTE.muted} opacity="0.55" />
          <text x="150" y="423" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" fill={PALETTE.urlText} textAnchor="middle" opacity="0.6">Place order · $84.00</text>
          <rect x="270" y="394" width="220" height="48" rx="10" fill="none" stroke="#e64a4a" strokeWidth="2" strokeDasharray="4 4" />
          <text x="380" y="416" fontFamily="ui-monospace" fontSize="10" fill="#e64a4a" textAnchor="middle">getByRole(&apos;button&apos;,</text>
          <text x="380" y="430" fontFamily="ui-monospace" fontSize="10" fill="#e64a4a" textAnchor="middle">{`{ name: 'Place order' }`}</text>
          <rect x="40" y="92" width="460" height="44" rx="10" fill="#fde0e0" stroke="#e64a4a" strokeWidth="1" />
          <circle cx="62" cy="114" r="9" fill="#e64a4a" />
          <text x="62" y="118" fontFamily="ui-monospace" fontWeight="700" fontSize="11" fill="white" textAnchor="middle">!</text>
          <text x="80" y="112" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="11" fill="#7a1a1a">Promo code &quot;FALL20&quot; couldn&apos;t be applied</text>
          <text x="80" y="126" fontFamily="Manrope, sans-serif" fontSize="10" fill="#7a1a1a" opacity="0.8">Place order is disabled until the promo is removed or replaced.</text>
        </>
      ) : (
        <>
          <rect x="40" y="394" width="220" height="48" rx="10" fill={filled ? PALETTE.ink : PALETTE.muted} />
          <text x="150" y="423" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" fill={filled ? PALETTE.bg : PALETTE.urlText} textAnchor="middle">Place order · $84.00</text>
        </>
      )}
      <rect x="550" y="118" width="220" height="180" rx="12" fill={PALETTE.muted} />
      <text x="568" y="146" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" fill={PALETTE.ink}>Order summary</text>
      <text x="568" y="180" fontFamily="Manrope, sans-serif" fontSize="11" fill={PALETTE.urlText}>Subtotal</text>
      <text x="752" y="180" fontFamily="ui-monospace" fontSize="11" fill={PALETTE.ink} textAnchor="end">$78.00</text>
      <text x="568" y="202" fontFamily="Manrope, sans-serif" fontSize="11" fill={PALETTE.urlText}>Shipping</text>
      <text x="752" y="202" fontFamily="ui-monospace" fontSize="11" fill={PALETTE.ink} textAnchor="end">$6.00</text>
      <text x="568" y="224" fontFamily="Manrope, sans-serif" fontSize="11" fill={PALETTE.urlText}>Promo (FALL20)</text>
      <text x="752" y="224" fontFamily="ui-monospace" fontSize="11" fill={PALETTE.ink} textAnchor="end">{broken ? "— error" : "−$0.00"}</text>
      <line x1="568" y1="244" x2="752" y2="244" stroke={PALETTE.divider} />
      <text x="568" y="274" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="13" fill={PALETTE.ink}>Total</text>
      <text x="752" y="274" fontFamily="ui-monospace" fontWeight="700" fontSize="13" fill={PALETTE.ink} textAnchor="end">$84.00</text>
    </g>
  );
}

const VARIANTS: Record<string, () => React.ReactNode> = {
  shop:           () => <ContentShop />,
  shopHover:      () => <ContentShop hovered={0} />,
  added:          () => <ContentAdded />,
  cart:           () => <ContentCart />,
  checkoutEmpty:  () => <ContentCheckout focusedField="email" />,
  checkoutFilled: () => <ContentCheckout filled />,
  paymentFilled:  () => <ContentPayment filled />,
  paymentBroken:  () => <ContentPayment filled broken />,
};

function Screenshot({ variant, url }: { variant: string; url: string }) {
  const render = VARIANTS[variant] || VARIANTS.shop;
  return <Chrome url={url}>{render()}</Chrome>;
}

// ─── Scoped styles ────────────────────────────────────────────────────────
// All design tokens + structural CSS scoped under `.pw-block` so they don't
// leak into the rest of the page. Mirrors the styles.css from the design.
const STYLES = `
.pw-block {
  --bg-page: #f4f1ec;
  --bg-card: #ffffff;
  --bg-sunken: #f7f5f1;
  --bg-chip: #f0ede7;
  --bg-screenshot: #ecead9;
  --border: rgba(20, 18, 14, 0.08);
  --border-strong: rgba(20, 18, 14, 0.14);
  --text-1: #1c1a15;
  --text-2: #5b574d;
  --text-3: #8c887d;
  --shadow-card: 0 1px 0 rgba(20, 18, 14, 0.04), 0 8px 28px rgba(20, 18, 14, 0.06);
  --pass: oklch(0.66 0.13 155);
  --pass-soft: oklch(0.94 0.05 155);
  --pass-ink: oklch(0.38 0.08 155);
  --fail: oklch(0.62 0.18 25);
  --fail-soft: oklch(0.95 0.04 25);
  --fail-ink: oklch(0.42 0.12 25);
  --flaky: oklch(0.74 0.14 75);
  --flaky-soft: oklch(0.95 0.05 75);
  --flaky-ink: oklch(0.46 0.10 65);
  --accent: oklch(0.62 0.15 285);
  --accent-soft: oklch(0.95 0.04 285);
  font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif;
  color: var(--text-1);
  width: 100%;
  max-width: 640px;
}
.pw-block * { box-sizing: border-box; }
.pw-block .pw {
  background: var(--bg-card);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto auto auto auto 1fr auto auto;
}
.pw-block .pw[data-density="compact"] { font-size: 13px; }
.pw-block .pw[data-density="comfortable"] { font-size: 14px; }
.pw-block .pw-tabs {
  display: flex; gap: 4px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-sunken);
}
.pw-block .pw-tab {
  font: inherit; font-size: 12px; font-weight: 600;
  padding: 5px 10px; border-radius: 7px;
  background: transparent; color: var(--text-2);
  border: 1px solid transparent; cursor: pointer;
}
.pw-block .pw-tab:hover { color: var(--text-1); background: var(--bg-chip); }
.pw-block .pw-tab[aria-pressed="true"] {
  background: var(--bg-card); color: var(--text-1);
  border-color: var(--border-strong);
  box-shadow: 0 1px 0 rgba(20,18,14,0.04);
}
.pw-block .pw-header {
  padding: 14px 18px;
  display: grid; grid-template-columns: auto 1fr auto;
  align-items: center; gap: 12px;
  border-bottom: 1px solid var(--border);
}
.pw-block .pw-status-dot {
  width: 36px; height: 36px; border-radius: 12px;
  display: grid; place-items: center;
}
.pw-block .pw-status-dot svg { width: 18px; height: 18px; }
.pw-block .pw-status-dot[data-status="failed"] { background: var(--fail-soft); color: var(--fail-ink); }
.pw-block .pw-status-dot[data-status="passed"] { background: var(--pass-soft); color: var(--pass-ink); }
.pw-block .pw-status-dot[data-status="flaky"]  { background: var(--flaky-soft); color: var(--flaky-ink); }
.pw-block .pw-title { display: grid; gap: 2px; min-width: 0; }
.pw-block .pw-title-name {
  font-size: 15px; font-weight: 700; color: var(--text-1);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pw-block .pw-title-meta {
  font-size: 12px; color: var(--text-2);
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
}
.pw-block .pw-title-meta .dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-3); }
.pw-block .pw-title-meta .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
.pw-block .pw-status-pill {
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  padding: 5px 10px; border-radius: 999px;
}
.pw-block .pw-status-pill[data-status="failed"] { background: var(--fail-soft); color: var(--fail-ink); }
.pw-block .pw-status-pill[data-status="passed"] { background: var(--pass-soft); color: var(--pass-ink); }
.pw-block .pw-status-pill[data-status="flaky"]  { background: var(--flaky-soft); color: var(--flaky-ink); }
.pw-block .pw-summary {
  padding: 10px 18px;
  display: flex; align-items: center; gap: 14px;
  font-size: 12px; color: var(--text-2);
  border-bottom: 1px solid var(--border);
  background: var(--bg-sunken);
}
.pw-block .pw-summary-stat { display: flex; align-items: center; gap: 6px; }
.pw-block .pw-summary-stat .swatch { width: 8px; height: 8px; border-radius: 3px; }
.pw-block .pw-summary-stat .swatch.pass { background: var(--pass); }
.pw-block .pw-summary-stat .swatch.fail { background: var(--fail); }
.pw-block .pw-summary-spacer { flex: 1; }
.pw-block .pw-summary-progress {
  height: 6px; border-radius: 999px; background: var(--bg-chip);
  flex: 1; display: flex; overflow: hidden; max-width: 180px;
}
.pw-block .pw-summary-progress > span { display: block; height: 100%; }
.pw-block .pw-summary-progress .pass { background: var(--pass); }
.pw-block .pw-summary-progress .fail { background: var(--fail); }
.pw-block .pw-failure {
  margin: 12px 18px 0;
  padding: 12px 14px;
  background: var(--fail-soft);
  border: 1px solid color-mix(in oklab, var(--fail) 22%, transparent);
  border-radius: 12px;
  display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start;
}
.pw-block .pw-failure-icon {
  width: 22px; height: 22px; border-radius: 7px;
  background: var(--fail); color: white;
  display: grid; place-items: center;
  font-size: 14px; font-weight: 800;
}
.pw-block .pw-failure-text { font-size: 13px; color: var(--fail-ink); line-height: 1.45; }
.pw-block .pw-failure-text .mono {
  font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
  background: color-mix(in oklab, var(--fail-soft) 60%, var(--bg-card));
  padding: 1px 5px; border-radius: 4px;
  border: 1px solid color-mix(in oklab, var(--fail) 18%, transparent);
}
.pw-block .pw-content { padding: 14px 18px 8px; }
.pw-block .pw-hero {
  position: relative; border-radius: 14px; overflow: hidden;
  background: var(--bg-screenshot); border: 1px solid var(--border);
  aspect-ratio: 16 / 10;
}
.pw-block .pw-hero-shot { position: absolute; inset: 0; }
.pw-block .pw-hero-shot svg { display: block; width: 100%; height: 100%; }
.pw-block .pw-hero-badge {
  position: absolute; top: 12px; left: 12px;
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px 5px 7px; border-radius: 999px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  background: var(--bg-card); color: var(--text-1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.pw-block .pw-hero-badge .dot { width: 8px; height: 8px; border-radius: 50%; }
.pw-block .pw-hero-badge[data-status="failed"] .dot { background: var(--fail); }
.pw-block .pw-hero-badge[data-status="passed"] .dot { background: var(--pass); }
.pw-block .pw-hero-badge[data-status="flaky"]  .dot { background: var(--flaky); }
.pw-block .pw-hero-step-num {
  position: absolute; top: 12px; right: 12px;
  padding: 5px 10px; border-radius: 999px;
  background: rgba(20,18,14,0.7); color: white;
  font-size: 11px; font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  backdrop-filter: blur(8px);
}
.pw-block .pw-hero-caption {
  position: absolute; left: 12px; right: 12px; bottom: 12px;
  padding: 10px 12px;
  background: rgba(20,18,14,0.78); color: white;
  backdrop-filter: blur(10px); border-radius: 10px;
  display: grid; gap: 2px;
}
.pw-block .pw-hero-caption-action {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(255,255,255,0.65);
}
.pw-block .pw-hero-caption-title { font-size: 14px; font-weight: 600; }
.pw-block .pw-scrubber {
  padding: 12px 18px 14px;
  display: grid; gap: 10px;
  border-top: 1px solid var(--border);
  background: var(--bg-sunken);
}
.pw-block .pw-scrubber-controls { display: flex; align-items: center; gap: 10px; }
.pw-block .pw-play-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: var(--text-1); color: var(--bg-card);
  border: none; display: grid; place-items: center;
  cursor: pointer; transition: transform .1s ease;
}
.pw-block .pw-play-btn:hover { transform: scale(1.05); }
.pw-block .pw-play-btn svg { width: 14px; height: 14px; }
.pw-block .pw-step-btn {
  width: 28px; height: 28px; border-radius: 8px;
  background: var(--bg-card); color: var(--text-2);
  border: 1px solid var(--border);
  display: grid; place-items: center; cursor: pointer;
}
.pw-block .pw-step-btn:hover { color: var(--text-1); border-color: var(--border-strong); }
.pw-block .pw-step-btn svg { width: 12px; height: 12px; }
.pw-block .pw-scrubber-track {
  position: relative; flex: 1; height: 28px;
  display: flex; align-items: center;
}
.pw-block .pw-scrubber-rail {
  position: absolute; left: 0; right: 0; top: 50%;
  transform: translateY(-50%); height: 6px;
  background: var(--bg-chip); border-radius: 999px; overflow: hidden;
}
.pw-block .pw-scrubber-fill {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--accent); border-radius: 999px;
  transition: width .25s ease;
}
.pw-block .pw-scrubber-ticks {
  position: relative; height: 28px; flex: 1;
  display: flex; align-items: center;
}
.pw-block .pw-scrubber-tick {
  position: absolute; top: 50%; transform: translate(-50%, -50%);
  width: 14px; height: 14px; border-radius: 50%;
  border: 2.5px solid var(--bg-sunken);
  cursor: pointer; transition: transform .15s ease; z-index: 1;
}
.pw-block .pw-scrubber-tick:hover { transform: translate(-50%, -50%) scale(1.25); }
.pw-block .pw-scrubber-tick[data-status="passed"] { background: var(--pass); }
.pw-block .pw-scrubber-tick[data-status="failed"] { background: var(--fail); }
.pw-block .pw-scrubber-tick[data-status="flaky"]  { background: var(--flaky); }
.pw-block .pw-scrubber-tick.active {
  transform: translate(-50%, -50%) scale(1.45);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 30%, transparent);
}
.pw-block .pw-scrubber-meta {
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--text-3);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  padding: 0 2px;
}
.pw-block .pw-timeline { display: grid; gap: 10px; padding: 4px 0 12px; }
.pw-block .pw-timeline-row {
  display: grid; grid-template-columns: 28px 1fr; gap: 12px; align-items: stretch;
}
.pw-block .pw-timeline-gutter { position: relative; display: grid; justify-items: center; }
.pw-block .pw-timeline-gutter::before {
  content: ''; position: absolute; top: 24px; bottom: -10px; left: 50%;
  width: 2px; background: var(--border); transform: translateX(-50%);
}
.pw-block .pw-timeline-row:last-child .pw-timeline-gutter::before { display: none; }
.pw-block .pw-timeline-pin {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid var(--bg-card);
  outline: 2px solid var(--border);
  margin-top: 6px; z-index: 1;
  display: grid; place-items: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10px; font-weight: 700; color: white;
}
.pw-block .pw-timeline-pin[data-status="passed"] { background: var(--pass); outline-color: color-mix(in oklab, var(--pass) 30%, transparent); }
.pw-block .pw-timeline-pin[data-status="failed"] { background: var(--fail); outline-color: color-mix(in oklab, var(--fail) 30%, transparent); }
.pw-block .pw-timeline-card {
  display: grid; grid-template-columns: 120px 1fr; gap: 12px;
  padding: 8px; border-radius: 12px;
  background: var(--bg-sunken); border: 1px solid var(--border);
  cursor: pointer; transition: background .15s ease, border-color .15s ease;
}
.pw-block .pw-timeline-card:hover { background: var(--bg-chip); border-color: var(--border-strong); }
.pw-block .pw-timeline-card.active {
  background: var(--accent-soft);
  border-color: color-mix(in oklab, var(--accent) 30%, transparent);
}
.pw-block .pw-timeline-card[data-status="failed"] {
  background: var(--fail-soft);
  border-color: color-mix(in oklab, var(--fail) 22%, transparent);
}
.pw-block .pw-timeline-shot {
  aspect-ratio: 16/10; border-radius: 7px; overflow: hidden;
  background: var(--bg-screenshot);
}
.pw-block .pw-timeline-shot svg { display: block; width: 100%; height: 100%; }
.pw-block .pw-timeline-info { display: grid; gap: 4px; align-content: center; min-width: 0; }
.pw-block .pw-timeline-action {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-3); font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.pw-block .pw-timeline-title { font-size: 13px; font-weight: 600; color: var(--text-1); line-height: 1.35; }
.pw-block .pw-timeline-meta {
  font-size: 11px; color: var(--text-2);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 2px;
}
.pw-block .pw-timeline-meta .selector {
  background: var(--bg-card); padding: 1px 6px; border-radius: 4px;
  border: 1px solid var(--border);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;
}
.pw-block .pw-rollup {
  margin: 4px 0; padding: 8px 12px;
  background: var(--bg-sunken);
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  font-size: 12px; color: var(--text-2);
  display: flex; align-items: center; gap: 8px; cursor: pointer;
}
.pw-block .pw-rollup:hover { background: var(--bg-chip); }
.pw-block .pw-rollup-count {
  font-family: 'JetBrains Mono', ui-monospace, monospace; font-weight: 700;
  color: var(--pass-ink); background: var(--pass-soft);
  padding: 1px 7px; border-radius: 999px; font-size: 11px;
}
.pw-block .pw-rollup svg { width: 12px; height: 12px; margin-left: auto; color: var(--text-3); }
.pw-block .pw-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px; padding-bottom: 12px;
}
.pw-block .pw-grid-cell {
  position: relative; aspect-ratio: 16/10;
  border-radius: 10px; overflow: hidden;
  background: var(--bg-screenshot);
  border: 1.5px solid var(--border);
  cursor: pointer; transition: transform .15s ease, border-color .15s ease;
}
.pw-block .pw-grid-cell:hover { transform: translateY(-2px); border-color: var(--border-strong); }
.pw-block .pw-grid-cell.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.pw-block .pw-grid-cell[data-status="failed"] {
  border-color: color-mix(in oklab, var(--fail) 40%, transparent);
}
.pw-block .pw-grid-cell svg { display: block; width: 100%; height: 100%; }
.pw-block .pw-grid-cell-label {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 18px 8px 6px;
  background: linear-gradient(to top, rgba(20,18,14,0.85), transparent);
  color: white; font-size: 10px; font-weight: 600;
  display: flex; align-items: center; justify-content: space-between; gap: 4px;
}
.pw-block .pw-grid-cell-num {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  background: rgba(255,255,255,0.2);
  padding: 1px 5px; border-radius: 4px;
}
.pw-block .pw-grid-cell-status {
  position: absolute; top: 6px; right: 6px;
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid white;
}
.pw-block .pw-grid-cell-status[data-status="passed"] { background: var(--pass); }
.pw-block .pw-grid-cell-status[data-status="failed"] { background: var(--fail); }
.pw-block .pw-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 18px 12px;
  border-top: 1px solid var(--border);
  background: var(--bg-card);
  font-size: 11px; color: var(--text-3);
}
.pw-block .pw-footer-brand {
  display: flex; align-items: center; gap: 6px; font-weight: 600;
}
.pw-block .pw-footer-brand-mark {
  width: 14px; height: 14px; border-radius: 4px;
  background: linear-gradient(135deg, var(--pass), var(--fail));
}
.pw-block .pw-footer-actions { display: flex; gap: 12px; }
.pw-block .pw-footer-actions button {
  background: none; border: none; color: var(--text-2);
  font: inherit; font-size: 11px; cursor: pointer;
  padding: 2px 4px; font-weight: 600;
}
.pw-block .pw-footer-actions button:hover { color: var(--text-1); }
`;

// ─── Sub-components ───────────────────────────────────────────────────────
function Hero({ step, total }: { step: Step; total: number }) {
  return (
    <div className="pw-hero">
      <div className="pw-hero-shot">
        <Screenshot variant={step.variant} url={step.url} />
      </div>
      <div className="pw-hero-badge" data-status={step.status}>
        <span className="dot" />
        {step.status}
      </div>
      <div className="pw-hero-step-num">
        {String(step.id).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div className="pw-hero-caption">
        <div className="pw-hero-caption-action">{ACTION_LABEL[step.action] || step.action}</div>
        <div className="pw-hero-caption-title">{step.title}</div>
      </div>
    </div>
  );
}

function Scrubber({
  steps, currentIdx, setCurrentIdx, playing, setPlaying,
}: {
  steps: Step[];
  currentIdx: number;
  setCurrentIdx: (i: number) => void;
  playing: boolean;
  setPlaying: (next: boolean | ((p: boolean) => boolean)) => void;
}) {
  const n = steps.length;
  const fillPct = n > 1 ? (currentIdx / (n - 1)) * 100 : 0;
  const totalMs = steps.reduce((s, st) => s + st.duration, 0);
  const elapsedMs = steps.slice(0, currentIdx + 1).reduce((s, st) => s + st.duration, 0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentIdx(Math.round(pct * (n - 1)));
  };

  return (
    <div className="pw-scrubber">
      <div className="pw-scrubber-controls">
        <button
          type="button"
          className="pw-play-btn"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg viewBox="0 0 16 16" fill="currentColor">
              <rect x="4" y="3" width="3" height="10" rx="1" />
              <rect x="9" y="3" width="3" height="10" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M5 3.5l7 4.5-7 4.5z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className="pw-step-btn"
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          aria-label="Previous step"
        >
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M10 3L5 8l5 5z" /></svg>
        </button>
        <button
          type="button"
          className="pw-step-btn"
          onClick={() => setCurrentIdx(Math.min(n - 1, currentIdx + 1))}
          aria-label="Next step"
        >
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M6 3l5 5-5 5z" /></svg>
        </button>
        <div className="pw-scrubber-track" ref={trackRef} onClick={onTrackClick}>
          <div className="pw-scrubber-rail">
            <div className="pw-scrubber-fill" style={{ width: `${fillPct}%` }} />
          </div>
          <div className="pw-scrubber-ticks">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`pw-scrubber-tick ${i === currentIdx ? "active" : ""}`}
                data-status={s.status}
                style={{ left: n > 1 ? `${(i / (n - 1)) * 100}%` : "50%" }}
                onClick={(e) => { e.stopPropagation(); setCurrentIdx(i); }}
                title={`${s.id}. ${s.title}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="pw-scrubber-meta">
        <span>Step {currentIdx + 1} of {n}</span>
        <span>{fmtMs(elapsedMs)} / {fmtMs(totalMs)}</span>
      </div>
    </div>
  );
}

function TimelineRow({
  step, active, onSelect,
}: {
  step: Step;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="pw-timeline-row">
      <div className="pw-timeline-gutter">
        <div className="pw-timeline-pin" data-status={step.status}>{step.id}</div>
      </div>
      <div
        className={`pw-timeline-card ${active ? "active" : ""}`}
        data-status={step.status}
        onClick={onSelect}
      >
        <div className="pw-timeline-shot">
          <Screenshot variant={step.variant} url={step.url} />
        </div>
        <div className="pw-timeline-info">
          <div className="pw-timeline-action">{ACTION_LABEL[step.action] || step.action}</div>
          <div className="pw-timeline-title">{step.title}</div>
          <div className="pw-timeline-meta">
            <span className="selector">{step.selector}</span>
            <span>{fmtMs(step.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rollup({ count, onExpand }: { count: number; onExpand: () => void }) {
  return (
    <div className="pw-rollup" onClick={onExpand}>
      <span className="pw-rollup-count">{count}</span>
      <span>passing steps hidden</span>
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function GridCell({
  step, active, onSelect,
}: {
  step: Step;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`pw-grid-cell ${active ? "active" : ""}`}
      data-status={step.status}
      onClick={onSelect}
    >
      <Screenshot variant={step.variant} url={step.url} />
      <div className="pw-grid-cell-status" data-status={step.status} />
      <div className="pw-grid-cell-label">
        <span className="pw-grid-cell-num">{String(step.id).padStart(2, "0")}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ACTION_LABEL[step.action] || step.action}
        </span>
      </div>
    </div>
  );
}

// ─── Block ────────────────────────────────────────────────────────────────
export default function PlaywrightResult() {
  const test = SAMPLE_TEST;
  const steps = test.steps;
  const n = steps.length;

  // Failure-focused default: jump to the failing step
  const initialIdx = useMemo(
    () => Math.max(0, steps.findIndex((s) => s.status === "failed")),
    [steps]
  );

  const [layout, setLayout] = useState<Layout>("filmstrip");
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [playing, setPlaying] = useState(false);
  const [expandedRollup, setExpandedRollup] = useState(false);

  // Auto-advance when playing
  useEffect(() => {
    if (!playing) return;
    if (currentIdx >= n - 1) { setPlaying(false); return; }
    const dur = Math.max(400, Math.min(1400, steps[currentIdx].duration / 4));
    const id = setTimeout(() => setCurrentIdx((i) => Math.min(n - 1, i + 1)), dur);
    return () => clearTimeout(id);
  }, [playing, currentIdx, steps, n]);

  // For timeline: hide passing steps, except the failing step and the one
  // right before it for context. Click the rollup to expand.
  const visibleSteps = useMemo(() => {
    if (expandedRollup) return steps.map((s, i) => ({ s, i, hidden: false }));
    const interestingIdx = new Set<number>();
    steps.forEach((s, i) => {
      if (s.status === "failed") {
        interestingIdx.add(i);
        if (i > 0) interestingIdx.add(i - 1);
      }
    });
    return steps.map((s, i) => ({ s, i, hidden: !interestingIdx.has(i) }));
  }, [steps, expandedRollup]);

  const current = steps[currentIdx];
  const passed = steps.filter((s) => s.status === "passed").length;
  const failed = steps.filter((s) => s.status === "failed").length;

  return (
    <div className="pw-block">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="pw" data-density="comfortable">
        {/* Layout tabs */}
        <div className="pw-tabs" role="tablist" aria-label="Layout">
          {(["filmstrip", "timeline", "grid"] as Layout[]).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-pressed={layout === l}
              className="pw-tab"
              onClick={() => setLayout(l)}
            >
              {l[0].toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="pw-header">
          <div className="pw-status-dot" data-status={test.status}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pw-title">
            <div className="pw-title-name">{test.title}</div>
            <div className="pw-title-meta">
              <span className="mono">{test.file}:{test.line}</span>
              <span className="dot" />
              <span>{test.project}</span>
              <span className="dot" />
              <span>{fmtMs(test.duration)}</span>
            </div>
          </div>
          <div className="pw-status-pill" data-status={test.status}>{test.status}</div>
        </div>

        {/* Summary bar */}
        <div className="pw-summary">
          <div className="pw-summary-stat"><span className="swatch pass" />{passed} passed</div>
          {failed > 0 && <div className="pw-summary-stat"><span className="swatch fail" />{failed} failed</div>}
          <div className="pw-summary-spacer" />
          <div className="pw-summary-progress">
            {steps.map((s, i) => (
              <span key={i} className={s.status === "failed" ? "fail" : "pass"} style={{ flex: 1 }} />
            ))}
          </div>
        </div>

        {/* Failure callout */}
        {test.failureSummary && (
          <div className="pw-failure">
            <div className="pw-failure-icon">!</div>
            <div className="pw-failure-text">
              <strong>Step {test.failureSummary.step}</strong> · {test.failureSummary.message}
              <div style={{ marginTop: 6, lineHeight: 1.5 }}>
                <span className="mono">{test.failureSummary.locator}</span>
              </div>
              <div style={{ marginTop: 6, opacity: 0.8 }}>{test.failureSummary.hint}</div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="pw-content">
          {layout === "filmstrip" && <Hero step={current} total={n} />}

          {layout === "timeline" && (
            <div className="pw-timeline">
              {visibleSteps.map((v, idx) => {
                if (v.hidden) {
                  const isFirstHidden = idx === 0 || !visibleSteps[idx - 1].hidden;
                  if (!isFirstHidden) return null;
                  let count = 0;
                  for (let j = idx; j < visibleSteps.length && visibleSteps[j].hidden; j++) count++;
                  return <Rollup key={`rollup-${idx}`} count={count} onExpand={() => setExpandedRollup(true)} />;
                }
                return (
                  <TimelineRow
                    key={v.s.id}
                    step={v.s}
                    active={v.i === currentIdx}
                    onSelect={() => setCurrentIdx(v.i)}
                  />
                );
              })}
            </div>
          )}

          {layout === "grid" && (
            <div className="pw-grid">
              {steps.map((s, i) => (
                <GridCell
                  key={s.id}
                  step={s}
                  active={i === currentIdx}
                  onSelect={() => setCurrentIdx(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scrubber (filmstrip + grid) */}
        {layout !== "timeline" && (
          <Scrubber
            steps={steps}
            currentIdx={currentIdx}
            setCurrentIdx={setCurrentIdx}
            playing={playing}
            setPlaying={setPlaying}
          />
        )}

        {/* Footer */}
        <div className="pw-footer">
          <div className="pw-footer-brand">
            <span className="pw-footer-brand-mark" />
            Playwright trace
          </div>
          <div className="pw-footer-actions">
            <button type="button">Open report ↗</button>
            <button type="button">Rerun</button>
          </div>
        </div>
      </div>
    </div>
  );
}
